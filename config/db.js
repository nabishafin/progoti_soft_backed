const dns = require('dns');
const mongoose = require('mongoose');

const connectDB = async () => {
  // Some local resolvers refuse the SRV lookup used by mongodb+srv:// URIs
  // (querySrv ECONNREFUSED). Use public DNS for it; set DNS_SERVERS= to disable.
  const dnsServers = (process.env.DNS_SERVERS ?? '8.8.8.8,1.1.1.1')
    .split(',').map((s) => s.trim()).filter(Boolean);
  if (dnsServers.length) dns.setServers(dnsServers);

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`\x1b[1;36m%s\x1b[0m`, `MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
