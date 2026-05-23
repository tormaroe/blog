const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const yaml = require('js-yaml');
const { Marked } = require('marked');
const hljs = require('highlight.js');
const moment = require('moment');

// Parse arguments for URL path prefixing (e.g. --prefix=/blog)
const args = process.argv.slice(2);
let pathPrefix = '';
args.forEach(arg => {
  if (arg.startsWith('--prefix=')) {
    pathPrefix = arg.substring(9);
  }
});
if (pathPrefix.endsWith('/') && pathPrefix !== '/') {
  pathPrefix = pathPrefix.slice(0, -1);
}

// Set locale to Norwegian Bokmål
moment.locale('nb');

// Initialize Marked with Highlight.js
const marked = new Marked({
  renderer: {
    code(codeOrToken, langOrUndefined) {
      const code = typeof codeOrToken === 'object' ? codeOrToken.text : codeOrToken;
      const lang = typeof codeOrToken === 'object' ? codeOrToken.lang : langOrUndefined;
      if (lang && hljs.getLanguage(lang)) {
        try {
          const highlighted = hljs.highlight(code, { language: lang }).value;
          return `<pre><code class="hljs ${lang}">${highlighted}</code></pre>`;
        } catch (err) {}
      }
      try {
        const highlighted = hljs.highlightAuto(code).value;
        return `<pre><code class="hljs">${highlighted}</code></pre>`;
      } catch (err) {
        return `<pre><code class="hljs">${code}</code></pre>`;
      }
    }
  }
});

// WordPress-style autop function
const autop = (pee) => {
  const blocklist = 'table|thead|tfoot|tbody|tr|td|th|caption|col|colgroup|div|dl|dd|dt|ul|ol|li|pre|select|form|blockquote|address|math|p|h[1-6]|fieldset|legend|hr|noscript|menu|samp|header|footer|article|section|hgroup|nav|aside|details|summary';

  if (pee.indexOf('<object') !== -1) {
    pee = pee.replace(/<object[\s\S]+?<\/object>/g, (a) => a.replace(/[\r\n]+/g, ''));
  }

  pee = pee.replace(/<[^<>]+>/g, (a) => a.replace(/[\r\n]+/g, ' '));

  if (pee.indexOf('<pre') !== -1 || pee.indexOf('<script') !== -1) {
    pee = pee.replace(/<(pre|script)[^>]*>[\s\S]+?<\/\1>/g, (a) => a.replace(/(\r\n|\n)/g, '<wp_temp_br>'));
  }

  pee = pee + '\n\n';
  pee = pee.replace(/<br \/>\s*<br \/>/gi, '\n\n');
  pee = pee.replace(new RegExp('(<(?:' + blocklist + ')(?: [^>]*)?>)', 'gi'), '\n$1');
  pee = pee.replace(new RegExp('(</(?:' + blocklist + ')>)', 'gi'), '$1\n\n');
  pee = pee.replace(/<hr( [^>]*)?>/gi, '<hr$1>\n\n');
  pee = pee.replace(/\r\n|\r/g, '\n');
  pee = pee.replace(/\n\s*\n+/g, '\n\n');
  pee = pee.replace(/([\s\S]+?)\n\n/g, '<p>$1</p>\n');
  pee = pee.replace(/<p>\s*?<\/p>/gi, '');
  pee = pee.replace(new RegExp('<p>\\s*(</?(?:' + blocklist + ')(?: [^>]*)?>)\\s*</p>', 'gi'), '$1');
  pee = pee.replace(/<p>(<li.+?)<\/p>/gi, '$1');
  pee = pee.replace(/<p>\s*<blockquote([^>]*)>/gi, '<blockquote$1><p>');
  pee = pee.replace(/<\/blockquote>\s*<\/p>/gi, '</p></blockquote>');
  pee = pee.replace(new RegExp('<p>\\s*(</?(?:' + blocklist + ')(?: [^>]*)?>)', 'gi'), '$1');
  pee = pee.replace(new RegExp('(</?(?:' + blocklist + ')(?: [^>]*)?>)\\s*</p>', 'gi'), '$1');
  pee = pee.replace(/\s*\n/gi, '<br />\n');
  pee = pee.replace(new RegExp('(</?(?:' + blocklist + ')[^>]*>)\\s*<br />', 'gi'), '$1');
  pee = pee.replace(/<br \/>(\s*<\/?(?:p|li|div|dl|dd|dt|th|pre|td|ul|ol)>)/gi, '$1');
  pee = pee.replace(/(?:<p>|<br ?\/?>)*\s*\[caption([^\[]+)\[\/caption\]\s*(?:<\/p>|<br ?\/?>)*/gi, '[caption$1[/caption]');

  pee = pee.replace(/(<(?:div|th|td|form|fieldset|dd)[^>]*>)(.*?)<\/p>/g, (a, b, c) => {
    if (c.match(/<p( [^>]*)?>/)) return a;
    return b + '<p>' + c + '</p>';
  });

  pee = pee.replace(/<wp_temp_br>/g, '\n');
  return pee;
};

// Featured articles & tags configuration (from old featured-articles.js)
const featuredTags = [
  { name: 'Bøker', slug: 'books', image: 'cbBooks.jpg', text: 'Her finner du en rekke anbefalte bøker for utviklere.' },
  { name: 'Common Lisp', slug: 'common-lisp', image: 'commonlisp.png', text: 'Lær deg Common Lisp, et fasinerende og nyttig, dynamisk typet språk som vil gi deg selvtillit.' },
  { name: 'Uncle Bob', slug: 'uncle-bob', image: 'ndc2011.jpg', text: 'Robert C. Martin har sterke meninger om hvordan profesjonelle utviklere skal oppføre seg!' },
  { name: 'Nim', slug: 'nimrod', image: 'bbNim.jpg', text: 'Nim er et statisk typet, effektivt språk med kraftige makroer og behagelig syntaks.' },
  { name: 'Norwegian Developers Conference', slug: 'ndc', image: 'bbNDC.jpg', text: 'NDC er en av verdens største og beste utviklerkonferanser.' },
  { name: 'C#', slug: 'csharp', image: 'bbCSharp.jpg', text: 'Jeg har kodet C# siden Microsoft lanserte språket, og du finner masse eksempler her på bloggen.' },
  { name: 'Git', slug: 'git', image: 'bbGit.jpg', text: 'Git er et viktig verktøy for veldig mange utviklere. Her finner du noen nyttige tips.' },
  { name: 'Pattern matching', slug: 'pattern-matching', image: 'bbPattern.jpg', text: 'Mønstergjennkjenning er en ekstremt kraftig og praktisk teknikk fra funksjonell programmering.' },
  { name: 'Clojure', slug: 'clojure', image: 'cbClojure.jpg', text: 'Clojure er en moderne Lisp på Java-plattformen.' },
  { name: 'WTF', slug: 'wtf', image: 'bbWTF.jpg', text: 'En litt spesiell kategori med ting som kanskje ikke er helt i henhold...' },
  { name: 'Esoteriske språk', slug: 'esoteriske-språk', image: 'bbUnlambda.jpg', text: 'Noen programmeringsspråk er kun laget for gøy.' },
  { name: 'Sterke meninger', slug: 'meninger', image: 'bbMeninger.jpg', text: 'Artikler med sterke meninger om programmering' },
  { name: 'F#', slug: 'fsharp', image: 'bbFSharp.jpg', text: 'F# er et kraftig språk i ML-familien som kombinerer funksjonell programmering og objektorientering på .NET og Mono.' },
  { name: 'Databaser', slug: 'databaser', image: 'bbDatabases.jpg', text: 'Relasjonsdatabaser, objektdatabaser, dokumentdatabaser, grafdatabaser - det finnes mange typer, og du bør vite litt om alle sammen.' },
  { name: 'CoffeeScript', slug: 'coffeescript', image: 'bbCoffeeScript2.jpg', text: 'Er ikke JavaScript elegant nok for deg? Da bør du kanskje ta en titt på CoffeeScript.' },
  { name: 'Kodekata', slug: 'kata', image: 'bbKata.jpg', text: 'Bli en bedre utvikler gjennom å øve deg på små treningsoppgaver!' }
];

const features = [
  { heading: 'Lisp for dummies', text: 'Du har hørt at Lisp og Clojure har kvaliteter som andre språk bare kan drømme om, men synes det ser så fremmed ut. Da kan denne enkle introduksjonen passe for deg!', link: 'http://blog.kjempekjekt.com/2010/08/02/lisp-for-dummies/', image: 'bbDummies.jpg' },
  { heading: 'Hva er smidig utvikling?', text: 'Trenger du en rask forklaring? Da behøver du ikke lete lengre.', link: 'http://blog.kjempekjekt.com/2012/02/24/hva-er-smidig-utvikling/', image: 'an-agile-person.jpg' },
  { heading: 'Ropy', text: 'Et litt spesielt programmeringsspråk.', link: 'http://blog.kjempekjekt.com/2013/01/01/ropy/', image: 'bbRopy.jpg' },
  { heading: 'Clean Code', text: 'Uncle Bob\'s Clean Code er en god bok både for nybegynnere og dem med litt mer erfaring. Har du lest den?', link: 'http://blog.kjempekjekt.com/2009/07/24/ren-kode/', image: 'bbClean.jpg' },
  { heading: 'Hemmeligheten bak funksjonell programmering avslørt', text: 'Det gir liksom ikke mening når koden ikke skal ha såkalte “side effects”, og man ikke engang kan endre variabler. Det er noe som ikke stemmer her, noe som mangler.', link: 'http://blog.kjempekjekt.com/2011/04/19/hemmeligheten-bak-funksjonell-programmering-avslrt', image: 'bbFp.jpg' },
  { heading: 'Kommunikasjon er utfordrende', text: 'Hva gjør kommunikasjon vanskelig, og hvilke teknikker kan man bruke for å gjøre den bedre?', link: 'http://blog.kjempekjekt.com/2013/05/12/kommunikasjon-er-utfordrende/', image: 'bbKommunikasjon.jpg' },
  { heading: 'En introduksjon til erlang', text: 'Erlang er et veldig spennende språk og platform for å lage skalerbare serverløsninger som yter maksimalt.', link: 'http://blog.kjempekjekt.com/2010/04/21/en-introduksjon-til-erlang/', image: 'bbErlang.jpg' },
  { heading: 'Den sosiale hjernen', text: 'Samspillet mellom emosjoner og det rasjonelle i hjernen påvirker hvordan vi fungerer sammen med andre.', link: 'http://blog.kjempekjekt.com/2013/05/20/den-sosiale-hjernen/', image: 'bbSosialHjerne.png' },
  { heading: 'Programmeringsparadigmer', text: 'Programmeringsparadigmene representerer ulike måter å tenke på når man skal løse problemer.', link: 'http://blog.kjempekjekt.com/2010/03/25/programmeringsparadigmer-ulike-mter-tenke-p/', image: 'bbParadigmer.jpg' },
  { heading: 'En god teamplayer', text: 'Alle sier de er gode teamplayere, men hva betyr det egentlig?', link: 'http://blog.kjempekjekt.com/2013/06/03/en-god-teamplayer/', image: 'bbTeamplayer.jpg' },
  { heading: 'Er Lisp bedre enn andre programmeringsspråk?', text: 'I 2010 oppdaget jeg en fantastisk verden som heter LISP. Les min første bloggpost om språket...', link: 'http://blog.kjempekjekt.com/2010/07/08/er-lisp-bedre-enn-andre-programmeringssprket/', image: 'bbLispbedre.jpg' },
  { heading: 'Programmerere lever i en pop-kultur', text: 'Utviklere styres av moter, og har alt for dårlig kjenskap til sine røtter.', link: 'http://blog.kjempekjekt.com/2014/03/09/programmerere-lever-i-en-popkultur/', image: 'bbEngelbart.jpg' },
  { heading: 'Regulære uttrykk', text: 'Regex kan brukes til mye rart, og kan gjøre deg utrolig effektiv til å løse enkelte oppgaver. Lær dem! Bruk dem!', link: 'http://blog.kjempekjekt.com/2011/12/23/regex/', image: 'bbRegex.jpg' },
  { heading: 'Conway & Coffee', text: 'Se min video hvor jeg implementerer Conways game of Life i en browser ved hjelp av CoffeeScript.', link: 'http://blog.kjempekjekt.com/2012/01/18/conways-game-of-life/', image: 'bbConway.jpg' },
  { heading: 'En funksjonell state machine', text: 'Mine tanker rundt hvordan en funksjonell tilstandsmaskin kan se ut.', link: 'http://blog.kjempekjekt.com/2015/01/05/funksjonell-state-machine/', image: 'ffsm.png' },
  { heading: 'May<T>', text: 'Her har du en fin implementasjon av option type for C#.', link: 'http://blog.kjempekjekt.com/2015/12/03/may-of-t/', image: 'maybe.png' },
  { heading: 'MessagePack', text: 'Kompakt serialisering av .NET-objekter med MessagePack.', link: 'http://blog.kjempekjekt.com/2015/05/12/kompakt-serialisering-med-messagepack/', image: 'messagepack.jpg' },
  { heading: '100% parprogrammering', text: 'Mine erfaringer med å jobbe i tospann.', link: 'http://blog.kjempekjekt.com/2016/05/29/parprogrammering/', image: 'bbRobert.jpg' },
  { heading: 'beanstalkd og Nim', text: 'Se hvordan jeg laget et klientbiblotek for banstalkd i Nim.', link: 'http://blog.kjempekjekt.com/2015/04/12/beanstalkd-klient-for-nim/', image: 'beanstalkd.png' }
];

function getRandomTwo() {
  const index = Math.floor(Math.random() * (features.length - 1));
  return [features[index], features[index + 1]];
}

function getRandomTag() {
  const index = Math.floor(Math.random() * (featuredTags.length - 1));
  return featuredTags[index];
}

// Tag Slugification Logic
const makeTagSlug = (tag) => {
  const hardcoded_tag_slugs = {
    'Bøker': 'books'
  };
  if (hardcoded_tag_slugs[tag] !== undefined) {
    return hardcoded_tag_slugs[tag];
  }
  return tag
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/#/g, "sharp")
    .replace(/\//g, "-")
    .replace(/ /g, "-")
    .replace(/\-\-+/g, "-")
    .replace(/&/g, "og");
};

const tagUrl = (tagName) => {
  return "/tags/" + makeTagSlug(tagName);
};

// Recursive file listing
const glob = (dir) => {
  let results = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(glob(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
};

// Write helper
const writeTo = (targetPath, content) => {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content);
};

// Parse Frontmatter
const parseFrontmatter = (page) => {
  let str = page.content;
  if (str.slice(0, 3) === '---') {
    let eol = '\n';
    if (str.slice(0, 5) === '---\r\n') {
      eol = '\r\n';
      str = str.substring(5);
    } else {
      str = str.substring(4);
    }

    let i = str.indexOf(eol);
    let fm = '';
    while (i !== -1) {
      const line = str.slice(0, i + eol.length);
      str = str.substring(i + eol.length);
      if (line.slice(0, 3) === '---') {
        break;
      } else {
        fm += line;
      }
      i = str.indexOf(eol);
    }
    try {
      page.data = yaml.load(fm) || {};
    } catch (e) {
      console.error("Error parsing YAML in " + page.localPath, e);
      page.data = {};
    }
    page.content = str;
  } else {
    page.data = {};
  }
};

// Main renderPage function
const renderPage = (page) => {
  const templatePath = path.resolve('./templates/' + page.data.layout + '.ejs');
  let template = fs.readFileSync(templatePath, 'utf8');
  
  // Dynamically rewrite legacy EJS includes (<% include name %> -> <%- include('name') %>)
  template = template.replace(/<%\s*include\s+([a-zA-Z0-9_\-]+)\s*%>/g, "<%- include('$1') %>");

  page.data.date_formatted = page.data.date ? moment(page.data.date).format("dddd D. MMMM YYYY") : '';
  page.filename = templatePath;
  page.data.disqus = false; // Disqus comments disabled

  const functions = {
    tagUrl: tagUrl
  };

  let mainContent = '';
  if (page.content && page.content.length > 0) {
    if (page.format === "html") {
      mainContent = autop(page.content);
    } else if (page.format === "markdown") {
      // Pre-process markdown images wrapped in HTML blocks (like <p>...)
      let processedContent = page.content.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (match, alt, src, title) => {
        const titleAttr = title ? ` title="${title}"` : '';
        return `<img src="${src}" alt="${alt}"${titleAttr} />`;
      });
      mainContent = marked.parse(processedContent);
    } else {
      mainContent = page.content;
    }
  }

  page.orig_content = mainContent;

  const renderData = {
    content: mainContent,
    data: page.data,
    functions: functions
  };

  return ejs.render(template, renderData, { filename: templatePath });
};

// URL replacement function
const cleanUrls = (dir, prefix) => {
  const files = glob(dir);
  files.forEach(filePath => {
    if (filePath.endsWith('.html') || filePath.endsWith('.json')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      const targetPrefix = prefix ? (prefix.endsWith('/') ? prefix : prefix + '/') : '/';
      content = content
        .replaceAll('http://blog.kjempekjekt.com/', targetPrefix)
        .replaceAll('http://programmeringsbloggen.no/', targetPrefix)
        .replaceAll('http://blog.kjempekjekt.com', prefix || '/')
        .replaceAll('http://programmeringsbloggen.no', prefix || '/');

      // Prepend prefix to root-relative paths in HTML/JSON attributes (preventing double-prefixing)
      if (prefix && prefix !== '/') {
        const prefixWithoutSlash = prefix.startsWith('/') ? prefix.slice(1) : prefix;
        const regexDoubleQuotes = new RegExp('(href|src)="\\/((?!' + prefixWithoutSlash + '(?:\\/|$))[^/<>][^"<>]*)"', 'g');
        const regexSingleQuotes = new RegExp('(href|src)=\'\\/((?!' + prefixWithoutSlash + '(?:\\/|$))[^/<>][^\'<>]*)\'', 'g');

        content = content.replace(regexDoubleQuotes, `$1="${prefix}/$2"`);
        content = content.replace(regexSingleQuotes, `$1='${prefix}/$2'`);
        content = content.replaceAll('href="/"', `href="${prefix}/"`);
        content = content.replaceAll('src="/"', `src="${prefix}/"`);
      }

      fs.writeFileSync(filePath, content);
    }
  });
};

// Build Main Site
const build = () => {
  console.log("Starting build process...");

  // 1. Clear docs folder
  console.log("Cleaning docs/ directory...");
  if (fs.existsSync('./docs')) {
    fs.rmSync('./docs', { recursive: true, force: true });
  }
  fs.mkdirSync('./docs', { recursive: true });

  // 2. Load all content pages
  console.log("Loading content pages...");
  const pages = [];
  const files = glob('./content');
  files.forEach(file => {
    const normalizedPath = file.replace(/\\/g, '/');
    const rawContent = fs.readFileSync(normalizedPath, 'utf8');
    const page = {
      localPath: normalizedPath,
      content: rawContent
    };
    page.format = normalizedPath.endsWith('.html') ? 'html' : (normalizedPath.endsWith('.md') ? 'markdown' : 'unknown');
    parseFrontmatter(page);
    pages.push(page);
  });

  console.log(`Loaded ${pages.length} content pages.`);

  // 3. Analyse Site (Sort and compile tags)
  console.log("Analyzing site structure and tags...");
  // Sort pages newest to oldest
  pages.sort((a, b) => {
    const dateA = a.data.date ? new Date(a.data.date) : new Date(0);
    const dateB = b.data.date ? new Date(b.data.date) : new Date(0);
    return dateB - dateA;
  });

  const tagsObject = {};
  pages.forEach(page => {
    if (!page.data.tags) {
      page.data.tags = [];
    }
    page.data.tags.forEach(tag => {
      if (!tagsObject[tag]) {
        tagsObject[tag] = {
          name: tag,
          slug: makeTagSlug(tag),
          count: 1
        };
      } else {
        tagsObject[tag].count++;
      }
    });

    const date = moment(page.data.date);
    page.year = date.format("YYYY");
    page.date_without_year = date.format("D. MMMM");
  });

  const getTagsArray = () => {
    return Object.keys(tagsObject).map(k => tagsObject[k]);
  };

  const tags = {
    sortedByName() {
      return getTagsArray().sort((a, b) => {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
    },
    sortedByCount() {
      return getTagsArray().sort((a, b) => b.count - a.count);
    }
  };

  // 4. Render and Write Post Pages
  console.log("Rendering and writing post pages...");
  pages.forEach(page => {
    const ext = path.extname(page.localPath);
    const relativePath = page.localPath.substring(8); // remove 'content/'
    const targetHtmlPath = path.join('./docs', 
      path.dirname(relativePath),
      path.basename(relativePath, ext),
      'index.html'
    );
    const renderedHtml = renderPage(page);
    writeTo(targetHtmlPath, renderedHtml);
  });

  // 5. Build Index page
  console.log("Generating index.html...");
  const pageToIndexViewModel = (p) => {
    return {
      data: {
        ...p.data,
        date: moment(p.data.date).format("dddd D. MMMM YYYY")
      },
      content: p.orig_content.replace(/(<([^>]+)>)/ig, "").slice(0, 300)
    };
  };

  const indexPage = {
    data: {
      layout: 'index',
      home_active: true,
      postCount: pages.length,
      posts: pages.slice(0, 5).map(pageToIndexViewModel),
      featured: getRandomTwo()[0],
      featuredTag: getRandomTag(),
      featuredTag2: getRandomTag(),
      tags: tags
    }
  };
  const renderedIndex = renderPage(indexPage);
  writeTo('./docs/index.html', renderedIndex);

  // 6. Build Sidebar JSON
  console.log("Generating sidebar.json...");
  const sidebar = {
    features: getRandomTwo(),
    featuredTag: getRandomTag(),
    posts: pages.slice(0, 10).map(p => ({
      link: p.data.link,
      title: p.data.title
    }))
  };
  writeTo('./docs/ajax/sidebar.json', JSON.stringify(sidebar, null, 2));

  // 7. Build Archive Pages
  console.log("Generating archive pages...");
  const grouped = {};
  pages.forEach(page => {
    const year = page.year;
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(page);
  });

  const archivePage = {
    data: {
      layout: 'archive',
      arkiv_active: true,
      title: 'Arkiv | Programmeringsbloggen',
      h1: 'Arkiv <small>alle postene samlet på ett sted!</small>',
      pages: grouped,
      grouped: true
    }
  };
  const renderedArchive = renderPage(archivePage);
  writeTo('./docs/arkiv/index.html', renderedArchive);

  for (const year of Object.keys(grouped)) {
    const archiveYearPage = {
      data: {
        layout: 'archive-year',
        title: 'Arkiv ' + year + ' | Programmeringsbloggen',
        h1: 'Arkiv ' + year,
        pages: grouped[year]
      }
    };
    const renderedYear = renderPage(archiveYearPage);
    writeTo(`./docs/${year}/index.html`, renderedYear);
  }

  // 8. Build Tag Pages
  console.log("Generating tag pages...");
  tags.sortedByName().forEach(tag => {
    const pagesForTag = pages.filter(p => p.data.tags.includes(tag.name));
    const tagPage = {
      data: {
        layout: 'tags',
        title: tag.name + " | Programmeringsbloggen",
        h1: tag.name,
        pages: pagesForTag
      }
    };
    const renderedTag = renderPage(tagPage);
    writeTo(`./docs/tags/${tag.slug}/index.html`, renderedTag);
  });

  // Group tags by letter for tag index
  const groups = {};
  tags.sortedByName().forEach(tag => {
    const letter = tag.name.toUpperCase().substring(0, 1);
    if (!groups[letter]) {
      groups[letter] = [];
    }
    groups[letter].push(tag);
  });
  const tagGroupNames = Object.keys(groups).sort();

  const tagsIndexPage = {
    data: {
      layout: 'tags-index',
      tags_active: true,
      title: "Tags | Programmeringsbloggen",
      tags: groups,
      tagGroupNames: tagGroupNames
    }
  };
  const renderedTagsIndex = renderPage(tagsIndexPage);
  writeTo('./docs/tags/index.html', renderedTagsIndex);

  // 9. Build Projects Page
  console.log("Generating projects page...");
  const projectsPage = {
    data: {
      layout: 'projects',
      projects_active: true
    }
  };
  const renderedProjects = renderPage(projectsPage);
  writeTo('./docs/prosjekter/index.html', renderedProjects);

  // 10. Build 404 Page
  console.log("Generating 404 page...");
  const page404 = {
    data: {
      layout: '404'
    }
  };
  const rendered404 = renderPage(page404);
  writeTo('./docs/404.html', rendered404);

  // 11. Copy Static Assets
  console.log("Copying static assets...");
  if (fs.existsSync('./assets')) {
    fs.cpSync('./assets', './docs/assets', { recursive: true });
  }
  if (fs.existsSync('./uploads')) {
    fs.cpSync('./uploads', './docs/uploads', { recursive: true });
  }

  // 12. Clean URLs in docs/ directory
  console.log("Cleaning absolute URLs to relative paths...");
  cleanUrls('./docs', pathPrefix);

  console.log("Build completed successfully!");
};

build();
