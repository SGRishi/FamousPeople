const fs = require('fs');
const { HttpsProxyAgent } = require('https-proxy-agent');
const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(args[0], { ...args[1], agent }));

const countries = {
  USA: {
    coords: [37.0902, -95.7129],
    candidates: [
      'Barack_Obama',
      'Donald_Trump',
      'George_Washington'
    ]
  },
  France: {
    coords: [46.2276, 2.2137],
    candidates: [
      'Napoleon',
      'Marie_Curie',
      'Charles_de_Gaulle'
    ]
  },
  Japan: {
    coords: [36.2048, 138.2529],
    candidates: [
      'Oda_Nobunaga',
      'Hayao_Miyazaki',
      'Yoko_Ono'
    ]
  }
};

const start = '20240101';
const end = '20240630';

async function getViews(title) {
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${title}/monthly/${start}/${end}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Failed for', title, res.status);
      return 0;
    }
    const data = await res.json();
    return data.items.reduce((sum, item) => sum + (item.views || 0), 0);
  } catch (e) {
    console.error('Error fetching', title, e);
    return 0;
  }
}

async function pickTopPerson(country) {
  let top = {title: null, views: 0};
  for (const title of country.candidates) {
    const views = await getViews(title);
    if (views > top.views) {
      top = {title, views};
    }
  }
  return {
    person: top.title,
    views: top.views,
    coords: country.coords
  };
}

async function main() {
  const result = {};
  for (const [name, data] of Object.entries(countries)) {
    result[name] = await pickTopPerson(data);
  }
  fs.writeFileSync('docs/famous_people.json', JSON.stringify(result, null, 2));
}

main();
