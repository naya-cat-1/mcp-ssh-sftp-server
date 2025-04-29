#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import Client from 'ssh2-sftp-client';

interface SFTPArgs {
  host: string;
  port: number;
  username: string;
  password: string;
  remotePath?: string;
  localPath?: string;
}

function validateSFTPArgs(args: unknown): asserts args is SFTPArgs {
  if (!args || typeof args !== 'object') {
    throw new McpError(ErrorCode.InvalidRequest, 'Invalid arguments: expected object');
  }

  const { host, port, username, password } = args as Record<string, unknown>;

  if (typeof host !== 'string') {
    throw new McpError(ErrorCode.InvalidRequest, 'Invalid host: expected string');
  }
  if (typeof port !== 'number') {
    throw new McpError(ErrorCode.InvalidRequest, 'Invalid port: expected number');
  }
  if (typeof username !== 'string') {
    throw new McpError(ErrorCode.InvalidRequest, 'Invalid username: expected string');
  }
  if (typeof password !== 'string') {
    throw new McpError(ErrorCode.InvalidRequest, 'Invalid password: expected string');
  }
}

class SFTPServer {
  private server: Server;
  private sftpClient: Client;

  constructor() {
    this.server = new Server({
      name: 'sftp-server',
      version: '0.1.0',
      capabilities: {
        tools: {},
      },
    });

    this.sftpClient = new Client();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.cleanup();
      process.exit(0);
    });

    this.setupToolHandlers();
  }

  private async cleanup() {
    try {
      await this.server.close();
      if (this.sftpClient) {
        await this.sftpClient.end();
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_directory',
          description: 'List contents of a remote directory via SFTP',
          inputSchema: {
            type: 'object',
            properties: {
              host: {
                type: 'string',
                description: 'SFTP host',
              },
              port: {
                type: 'number',
                description: 'SFTP port',
              },
              username: {
                type: 'string',
                description: 'SFTP username',
              },
              password: {
                type: 'string',
                description: 'SFTP password',
              },
              remotePath: {
                type: 'string',
                description: 'Remote directory path to list',
              },
            },
            required: ['host', 'port', 'username', 'password', 'remotePath'],
          },
        },
        {
          name: 'upload_file',
          description: 'Upload a file via SFTP',
          inputSchema: {
            type: 'object',
            properties: {
              host: {
                type: 'string',
                description: 'SFTP host',
              },
              port: {
                type: 'number',
                description: 'SFTP port',
              },
              username: {
                type: 'string',
                description: 'SFTP username',
              },
              password: {
                type: 'string',
                description: 'SFTP password',
              },
              localPath: {
                type: 'string',
                description: 'Local file path to upload',
              },
              remotePath: {
                type: 'string',
                description: 'Remote path to upload to',
              },
            },
            required: ['host', 'port', 'username', 'password', 'localPath', 'remotePath'],
          },
        },
        {
          name: 'download_file',
          description: 'Download a file via SFTP',
          inputSchema: {
            type: 'object',
            properties: {
              host: {
                type: 'string',
                description: 'SFTP host',
              },
              port: {
                type: 'number',
                description: 'SFTP port',
              },
              username: {
                type: 'string',
                description: 'SFTP username',
              },
              password: {
                type: 'string',
                description: 'SFTP password',
              },
              remotePath: {
                type: 'string',
                description: 'Remote file path to download',
              },
              localPath: {
                type: 'string',
                description: 'Local path to save the file',
              },
            },
            required: ['host', 'port', 'username', 'password', 'remotePath', 'localPath'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;
        validateSFTPArgs(args);

        console.error(`[SFTP] Attempting to connect to ${args.host}:${args.port}`);

        // Connect to SFTP server with timeout and debug options
        try {
          await this.sftpClient.connect({
            host: args.host,
            port: args.port,
            username: args.username,
            password: args.password,
            timeout: 10000, // 10 seconds timeout
            debug: (msg: string) => console.error(`[SFTP Debug] ${msg}`),
            retries: 3, // Number of connection retries
            retry_factor: 2, // Exponential backoff factor
            retry_minTimeout: 2000, // Minimum time between retries (2 seconds)
          });
          
          console.error('[SFTP] Successfully connected');
        } catch (error) {
          console.error('[SFTP] Connection error:', error);
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Failed to connect to SFTP server: ${error instanceof Error ? error.message : String(error)}`
          );
        }

        let result;
        try {
          switch (name) {
            case 'list_directory':
              if (!args.remotePath) {
                throw new Error('Remote path is required');
              }
              console.error(`[SFTP] Listing directory: ${args.remotePath}`);
              result = await this.sftpClient.list(args.remotePath);
              console.error('[SFTP] Directory listed successfully');
              break;

            case 'upload_file':
              if (!args.localPath || !args.remotePath) {
                throw new Error('Local path and remote path are required');
              }
              console.error(`[SFTP] Uploading file from ${args.localPath} to ${args.remotePath}`);
              await this.sftpClient.put(args.localPath, args.remotePath);
              result = { message: 'File uploaded successfully' };
              console.error('[SFTP] File uploaded successfully');
              break;

            case 'download_file':
              if (!args.remotePath || !args.localPath) {
                throw new Error('Remote path and local path are required');
              }
              console.error(`[SFTP] Downloading file from ${args.remotePath} to ${args.localPath}`);
              await this.sftpClient.get(args.remotePath, args.localPath);
              result = { message: 'File downloaded successfully' };
              console.error('[SFTP] File downloaded successfully');
              break;

            default:
              throw new McpError(
                ErrorCode.MethodNotFound,
                `Unknown command: ${name}`
              );
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          console.error('[SFTP] Operation error:', error);
          throw new McpError(
            ErrorCode.InvalidRequest,
            `SFTP operation failed: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      } finally {
        try {
          console.error('[SFTP] Closing connection');
          await this.sftpClient.end();
          console.error('[SFTP] Connection closed');
        } catch (error) {
          console.error('[SFTP] Error closing connection:', error);
        }
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('SFTP MCP server running on stdio');
  }
}

const server = new SFTPServer();
server.run().catch(console.error);