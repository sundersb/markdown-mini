'use strict';

const Parser = require('@sundersb/parser-mini');

const {
    Text,
    Bold,
    Italic,
    Link,
    Header,
    ListItem,
    OrderedList,
    UnorderedList,
    Paragraph,
} = require('./markdown-lexer');

/**
 * @typedef {import('./markdown-lexer').InlineElement} InlineElement
 * @typedef {import('./markdown-lexer').BlockElement} BlockElement
 * @typedef {import('@sundersb/parser-mini/parser').Predicate} Predicate
 * @typedef {import('@sundersb/parser-mini/parser').Mapper} Mapper
 */

/** @type {Predicate} */
const isNotParagraph = text => !text.startsWith('\r\n\r\n')
    && !text.startsWith('\n\n');

/** @type {Predicate} */
const isLinebreak = text => text[0] == '\n' || text.startsWith('\r\n');

/** @type {Predicate} */
const isDigit = char => '0123456789'.includes(char);

/** @type {Mapper<string[],string>} */
const join = chars => chars.join('');

/** @type {Parser<any,string>} */
const lineBreakParser = Parser
    .char('\n')
    .or(Parser.string('\r\n'));

const untilSpaceParser = Parser.sat(c => c != ' ')
    .many()
    .fmap(join);

/** @type {Parser<any,string>} */
const untilLineBreak = Parser.item()
    .many(1, 0, text => !isLinebreak(text))
    .fmap(join);

const consumeSingleLineBreakIfAny = Parser
    .peek(isNotParagraph)
    .seq(lineBreakParser)
    .default('');

/**
 * Make text element
 * @param {string} text Text
 * @returns {Text}
 */
const makeText = (text) => new Text(text);

/**
 * Make bold element
 * @param {InlineElement[]} content Content
 * @returns {Bold}
 */
const makeBold = (content) => new Bold(content);

/**
 * Make italic
 * @param {InlineElement[]} content Content
 * @returns {Italic}
 */
const makeItalic = (content) => new Italic(content);

/**
 * @param {number} amount Stars amount
 * @returns {Parser<any,string>}
 */
function makeStarsParser(amount) {
    const stars = '*'.repeat(amount);
    const moreStars = '*'.repeat(amount + 1);

    const exactQuote = Parser.string(stars);

    const untilQuote = Parser
        .item()
        .many(0, 0, text => !text.startsWith(stars) || text.startsWith(moreStars))
        .fmap(cs => cs.join(''));

    return exactQuote
        .seq(untilQuote)
        .pass(exactQuote);
}

/**
 * @param {Parser<any,InlineElement>} parser 
 * @returns {Parser<any,InlineElement[]>}
 */
const makeContentParser = parser => Parser.repeat(parser, makeText, isNotParagraph);

const hintParser = Parser.char(' ').many()
    .seq(Parser.quoted('"').or(Parser.all()));

/** @type {Parser<any,Link>} */
const linkParser = Parser
    .brackets('[', ']').save('text')
    .bind(Parser.brackets('(', ')').save('hrefTitle'))
    .bindInversed(untilSpaceParser.save('href').bind(hintParser.save('hint')), 'hrefTitle')
    .fmap(data => new Link(data.href, data.text, data.hint));

/** @type {Parser<any,Italic>} */
const italicParser = makeStarsParser(1)
    .seqInversed(makeContentParser(linkParser))
    .fmap(makeItalic);

/** @type {Parser<any,Bold>} */
const boldParser = makeStarsParser(2)
    .seqInversed(makeContentParser(linkParser.or(italicParser)))
    .fmap(makeBold);

/**
 * Inline elements parser
 * @type {Parser<any,InlineElement[]>}
 * @description Parsers order matters: italic must be after bold to avoid artifacts
 */
const contentParser = makeContentParser(linkParser.or(boldParser).or(italicParser));

const headerParser = Parser.char('#').many(1).fmap(cs => cs.length).save('level')
    .pass(Parser.char(' ').many())
    .bind(contentParser.save('content'))
    .fmap(data => new Header(data.level, data.content));

const unorderedItemParser = Parser
    .char('*')
    .pass(Parser.char(' ').many(1))
    .seq(untilLineBreak)
    .pass(consumeSingleLineBreakIfAny)
    .seqInversed(contentParser)
    .fmap(content => new ListItem(content));

const unorderedParser = Parser
    .peek(text => text.startsWith('* '))
    .seq(unorderedItemParser.many(1, 0, isNotParagraph))
    .fmap(items => new UnorderedList(items));

const orderedItemParser = Parser
    .sat(isDigit).many(1)
    .pass(Parser.char('.'))
    .pass(Parser.char(' ').many(1))
    .seq(untilLineBreak)
    .pass(consumeSingleLineBreakIfAny)
    .seqInversed(contentParser)
    .fmap(content => new ListItem(content));

const orderedParser = Parser
    .peek(text => /^\d+\.\s/.test(text))
    .seq(orderedItemParser.many(1, 0, isNotParagraph))
    .fmap(items => new OrderedList(items));

/** @type {Parser<any,Paragraph>} */
const paragraphParser = contentParser.fmap(content => new Paragraph(content));

const blockElementParser = headerParser
    .or(unorderedParser)
    .or(orderedParser)
    .or(paragraphParser);

const blocksParser = blockElementParser
    .pass(lineBreakParser.many())
    .many();

/**
 * Parse markdown to pseudo DOM
 * @param {string|undefined} text Markdown text to parse
 * @returns {object[]}
 */
function parseMarkdown(text) {
    if (!text) return [];

    text = text.trim();

    if (!text) return [];

    const result = blocksParser.parseText(text);

    return result
        ? result.parsed.map(p => p.make())
        : { name: 'p', children: [text] };
}

/**
 * Transform Markdown to HTML text
 * @param {string} text Markdown text
 * @returns {string}
 */
function markdownToHtml(text) {
    if (!text) return [];

    text = text.trim();

    if (!text) return [];

    const result = blocksParser.parseText(text);

    return result
        ? result.parsed.map(p => p.html()).join('')
        : `<p>${text}</p>`;
}

module.exports = {
    parseMarkdown,
    markdownToHtml,

    linkParser,
    italicParser,
    boldParser,
    headerParser,
    paragraphParser,
    unorderedParser,
    orderedParser,
};
