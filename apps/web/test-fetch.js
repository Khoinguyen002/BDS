import qs from 'qs-esm';
const search = qs.stringify({ where: { slug: { equals: 'penthouse-the-river-thu-thiem' } }, depth: 2, locale: 'vi' }, { addQueryPrefix: true });
console.log(`http://localhost:3001/api/apartments${search}`);
fetch(`http://localhost:3001/api/apartments${search}`).then(res => res.json()).then(data => console.log(typeof data.docs[0].owner, data.docs[0].owner.agentSlug));
