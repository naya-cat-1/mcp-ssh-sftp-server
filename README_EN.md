# MCP SSH/SFTP Server

English | [简体中文](README.md)

A collection of SSH and SFTP servers implemented based on the Model Context Protocol (MCP), providing remote server operations and file transfer capabilities.

## Project Structure

```
.
├── ssh-server/    # SSH server implementation
└── sftp-server/   # SFTP server implementation
```

## Features

### SSH Server
The SSH server provides remote command execution functionality, supporting:
- Connection to remote SSH servers
- Remote command execution and result retrieval
- Automatic connection termination and resource cleanup

### SFTP Server
The SFTP server provides file transfer-related functionality, supporting:
- Listing remote directory contents
- Uploading local files to remote servers
- Downloading files from remote servers
- Automatic connection retry mechanism
- Detailed debug logging

## Available Tools

### SSH Tools

#### execute_ssh_command
Execute remote SSH commands
- Parameters:
  - host: SSH server address
  - port: SSH port
  - username: Username
  - password: Password
  - command: Command to execute

### SFTP Tools

#### list_directory
List remote directory contents
- Parameters:
  - host: SFTP server address
  - port: SFTP port
  - username: Username
  - password: Password
  - remotePath: Remote directory path to list

#### upload_file
Upload files to remote server
- Parameters:
  - host: SFTP server address
  - port: SFTP port
  - username: Username
  - password: Password
  - localPath: Local file path
  - remotePath: Remote destination path

#### download_file
Download files from remote server
- Parameters:
  - host: SFTP server address
  - port: SFTP port
  - username: Username
  - password: Password
  - remotePath: Remote file path
  - localPath: Local save path

## Error Handling

Both servers implement comprehensive error handling mechanisms:
- Connection timeout handling
- Automatic retry mechanism (SFTP server)
- Detailed error message output
- Automatic resource cleanup

## Security Notes

- All password information is only used temporarily in memory and is not persistently stored
- Connections are automatically terminated after each operation
- Connection timeout mechanism supported to prevent resource occupation
- Secure handling of sensitive credentials

## Debug Features

The SFTP server provides detailed debug log output, including:
- Connection status logs
- Operation execution process logs
- Error detail logs

## Important Notes

1. Ensure proper server access permissions before use
2. Test connection parameters before implementation
3. Consider network conditions and timeout settings for large file transfers
4. Handle all password information securely to prevent leaks

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Build the servers:
```bash
npm run build
```

3. Configure your server connection parameters in your MCP settings.

4. Use the provided tools through the MCP interface to interact with remote servers.

## Development

- Written in TypeScript for type safety
- Uses modern async/await patterns
- Implements comprehensive error handling
- Follows best practices for secure credential handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.