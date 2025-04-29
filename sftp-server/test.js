import Client from 'ssh2-sftp-client';

async function testConnection() {
  const sftp = new Client();
  
  try {
    console.log('Connecting to SFTP server...');
    await sftp.connect({
      host: '192.168.207.36',
      port: 22,
      username: 'admin1',
      password: '111111',
      debug: msg => console.log('Debug:', msg)
    });
    
    console.log('Connected successfully!');
    
    console.log('Listing directory contents...');
    const list = await sftp.list('/');
    console.log('Directory contents:', list);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    try {
      await sftp.end();
    } catch (err) {
      console.error('Error closing connection:', err);
    }
  }
}

testConnection();