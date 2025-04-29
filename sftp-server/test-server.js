import { spawn } from 'child_process';

// 启动SFTP服务器
const server = spawn('node', ['build/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// 测试命令
const testCommand = JSON.stringify({
  name: "list_directory",
  arguments: {
    host: "192.168.207.36",
    port: 22,
    username: "admin1",
    password: "111111",
    remotePath: "/home/admin1"
  }
}) + '\n';

// 处理服务器输出
server.stdout.on('data', (data) => {
  console.log('Server response:', data.toString());
});

// 处理错误
server.on('error', (err) => {
  console.error('Server error:', err);
});

// 发送测试命令
server.stdin.write(testCommand);
server.stdin.end();

// 设置超时
setTimeout(() => {
  server.kill();
}, 5000);