#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { NodeSSH } from 'node-ssh';

class SSHServer {
  private server: Server;
  private ssh: NodeSSH;

  constructor() {
    this.server = new Server(
      {
        name: 'ssh-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.ssh = new NodeSSH();

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'execute_ssh_command',
          description: 'Execute command on remote server via SSH',
          inputSchema: {
            type: 'object',
            properties: {
              host: {
                type: 'string',
                description: 'SSH host',
              },
              port: {
                type: 'number',
                description: 'SSH port',
              },
              username: {
                type: 'string',
                description: 'SSH username',
              },
              password: {
                type: 'string',
                description: 'SSH password',
              },
              command: {
                type: 'string',
                description: 'Command to execute',
              },
            },
            required: ['host', 'port', 'username', 'password', 'command'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'execute_ssh_command') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      const { host, port, username, password, command } = request.params.arguments;

      try {
        await this.ssh.connect({
          host,
          port,
          username,
          password,
        });

        const result = await this.ssh.execCommand(command);
        await this.ssh.dispose();

        return {
          content: [
            {
              type: 'text',
              text: result.stdout || result.stderr,
            },
          ],
        };
      } catch (error) {
        await this.ssh.dispose();
        return {
          content: [
            {
              type: 'text',
              text: `SSH error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('SSH MCP server running on stdio');
  }
}

const server = new SSHServer();
server.run().catch(console.error);