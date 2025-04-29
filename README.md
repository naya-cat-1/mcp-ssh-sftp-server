# MCP SSH/SFTP 服务器

[English](README_EN.md) | 简体中文

这是一个基于 Model Context Protocol (MCP) 实现的 SSH 和 SFTP 服务器集合，提供了远程服务器操作和文件传输的功能。

## 项目结构

```
.
├── ssh-server/    # SSH服务器实现
└── sftp-server/   # SFTP服务器实现
```

## 功能特性

### SSH 服务器
SSH服务器提供远程命令执行功能，支持：
- 连接到远程SSH服务器
- 执行远程命令并获取结果
- 自动断开连接和资源清理

### SFTP 服务器
SFTP服务器提供文件传输相关功能，支持：
- 列出远程目录内容
- 上传本地文件到远程服务器
- 从远程服务器下载文件
- 自动重试连接机制
- 详细的调试日志

## 可用工具

### SSH 工具

#### execute_ssh_command
执行远程SSH命令
- 参数：
  - host: SSH服务器地址
  - port: SSH端口
  - username: 用户名
  - password: 密码
  - command: 要执行的命令

### SFTP 工具

#### list_directory
列出远程目录内容
- 参数：
  - host: SFTP服务器地址
  - port: SFTP端口
  - username: 用户名
  - password: 密码
  - remotePath: 要列出内容的远程目录路径

#### upload_file
上传文件到远程服务器
- 参数：
  - host: SFTP服务器地址
  - port: SFTP端口
  - username: 用户名
  - password: 密码
  - localPath: 本地文件路径
  - remotePath: 远程目标路径

#### download_file
从远程服务器下载文件
- 参数：
  - host: SFTP服务器地址
  - port: SFTP端口
  - username: 用户名
  - password: 密码
  - remotePath: 远程文件路径
  - localPath: 本地保存路径

## 错误处理

两个服务器都实现了完善的错误处理机制：
- 连接超时处理
- 自动重试机制（SFTP服务器）
- 详细的错误信息输出
- 资源自动清理

## 安全说明

- 所有密码信息都只在内存中临时使用，不会被持久化存储
- 每次操作后都会自动断开连接
- 支持连接超时机制，避免资源占用

## 调试功能

SFTP服务器提供了详细的调试日志输出，包括：
- 连接状态日志
- 操作执行过程日志
- 错误详情日志

## 注意事项

1. 使用前请确保有正确的服务器访问权限
2. 建议在使用前测试连接参数
3. 对于大文件传输，请注意网络状况和超时设置
4. 所有密码信息请妥善保管，避免泄露