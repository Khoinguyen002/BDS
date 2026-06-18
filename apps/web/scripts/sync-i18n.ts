import fs from 'fs';
import path from 'path';

async function syncTranslations() {
  const SERVER_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001';
  console.log(`[i18n Sync] Fetching translations from ${SERVER_URL}/api/translations...`);

  try {
    const res = await fetch(`${SERVER_URL}/api/translations?limit=2000&locale=en`);
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }
    const data = await res.json();
    
    // Use Record<string, DictionaryNode> to allow deep nested objects without strict typing here
    type DictionaryNode = string | { [key: string]: DictionaryNode };
    const dictionary: Record<string, DictionaryNode> = {};

    if (data.docs && Array.isArray(data.docs)) {
      data.docs.forEach((doc: { key?: string; value?: string }) => {
        if (doc.key && doc.value) {
          const parts = doc.key.split('.');
          let current = dictionary;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
              current[parts[i]] = {};
            }
            current = current[parts[i]] as Record<string, DictionaryNode>;
          }
          current[parts[parts.length - 1]] = doc.value;
        }
      });
    }

    const outputDir = path.resolve(process.cwd(), 'messages');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const outputPath = path.join(outputDir, 'en.json');
    fs.writeFileSync(outputPath, JSON.stringify(dictionary, null, 2), 'utf-8');
    
    console.log(`[i18n Sync] Successfully generated ${outputPath}`);
    console.log(`[i18n Sync] next-intl types are now updated based on this JSON file!`);
  } catch (error) {
    console.error('[i18n Sync] Error syncing translations:', error);
    process.exit(1);
  }
}

syncTranslations();
