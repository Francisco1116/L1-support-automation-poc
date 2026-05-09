import express, { type Request, type Response } from 'express';
import dns from 'dns/promises';

interface DnsRequest {
  domain: string;
}

const app = express();
app.use(express.json());

app.post('/check-dns', async (req: Request<{}, {}, DnsRequest>, res: Response) => {
  const domain = req.body.domain;

  if (!domain) {
    return res.status(400).json({ error: 'Domain parameter is required' });
  }

  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0] || '';

    const records = await dns.resolve4(cleanDomain);

    console.log(`[SUCCESS] Resolved domain: ${cleanDomain} -> ${records}`);

    res.json({
      status: 'success',
      domain: cleanDomain,
      ip_addresses: records,
      message: `DNS check successful! Domain resolves to IP(s): ${records.join(', ')}`
    });
  } catch (error: any) {
    console.error(`[FAILED] Failed to resolve domain: ${domain} -> ${error.message}`);

    res.status(500).json({
      status: 'failed',
      domain: domain,
      error: error.message,
      message: `DNS check failed: Unable to resolve the provided domain.`
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`TS DNS Diagnostics Microservice running on http://localhost:${PORT}`);
});