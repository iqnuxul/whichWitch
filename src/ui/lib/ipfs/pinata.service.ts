/**
 * Pinata IPFS 服务 - 处理文件上传到 IPFS
 */

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

/**
 * 上传文件到 Pinata
 */
export async function uploadFileToPinata(file: File): Promise<string> {
  // 检查配置
  if (!PINATA_JWT) {
    throw new Error('Pinata JWT not configured. Please set PINATA_JWT environment variable.');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append('pinataMetadata', metadata);

    console.log('Uploading to Pinata...');
    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata error response:', errorText);
      throw new Error(`Pinata upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Pinata upload successful:', data.IpfsHash);
    return data.IpfsHash;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw error;
  }
}

/**
 * 上传 JSON 数据到 Pinata
 */
export async function uploadJSONToPinata(jsonData: any, name?: string): Promise<string> {
  // 检查配置
  if (!PINATA_JWT) {
    throw new Error('Pinata JWT not configured. Please set PINATA_JWT environment variable.');
  }

  try {
    console.log('Uploading JSON to Pinata...');
    const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: jsonData,
        pinataMetadata: {
          name: name || 'metadata.json',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata JSON error response:', errorText);
      throw new Error(`Pinata JSON upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    throw error;
  }
}

/**
 * 创建作品 metadata 并上传
 */
export async function createAndUploadMetadata(workData: {
  title: string;
  description?: string;
  story?: string;
  imageHash: string; // IPFS hash of the image
  images?: string[]; // Array of IPFS URLs for multiple images
  material?: string[];
  tags?: string[];
  creator: string;
  parentWorkId?: number;
}): Promise<string> {
  const metadata = {
    name: workData.title,
    description: workData.description || '',
    image: `ipfs://${workData.imageHash}`,
    images: workData.images || [],
    attributes: [
      ...(workData.material?.map(m => ({ trait_type: 'Material', value: m })) || []),
      ...(workData.tags?.map(t => ({ trait_type: 'Tag', value: t })) || []),
    ],
    properties: {
      story: workData.story || '',
      creator: workData.creator,
      parentWorkId: workData.parentWorkId || null,
      createdAt: new Date().toISOString(),
    },
  };

  const metadataHash = await uploadJSONToPinata(metadata, `${workData.title}-metadata`);
  return metadataHash;
}

/**
 * 获取 IPFS URL
 */
export function getIPFSUrl(hash: string): string {
  return `${PINATA_GATEWAY}/${hash}`;
}

/**
 * 从 IPFS URI 获取 HTTP URL
 */
export function ipfsToHttp(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    const hash = uri.replace('ipfs://', '');
    return getIPFSUrl(hash);
  }
  return uri;
}

/**
 * 批量上传文件
 */
export async function uploadMultipleFiles(files: File[]): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadFileToPinata(file));
    const hashes = await Promise.all(uploadPromises);
    return hashes;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
}

/**
 * 检查 Pinata 配置是否有效
 */
export function isPinataConfigured(): boolean {
  return !!(PINATA_JWT || (PINATA_API_KEY && PINATA_SECRET));
}
