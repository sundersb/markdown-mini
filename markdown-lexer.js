'use strict';

const makeContent = content => content
    ? content.map(c => c.make())
    : [];

const contentToHtml = content => content
    ? content.map(c => c.html()).join('')
    : '';

/**
 * @typedef {Header|OrderedList|UnorderedList|Paragraph} BlockElement
 * @typedef {Text|Bold|Italic|Link} InlineElement
 */

/**
 * Raw text
 * @param {string} text Text
 */
function Text(text) {
    this.text = text;
    this.make = () => text;
    this.html = () => text;
}

/**
 * Bold text
 * @param {InlineElement[]} content Content
 */
function Bold(content) {
    this.content = content;
    this.make = () => ({
        name: 'b',
        children: makeContent(this.content),
    });
    this.html = () => `<b>${contentToHtml(this.content)}</b>`;
}

/**
 * Italic
 * @param {InlineElement[]} content Content
 */
function Italic(content) {
    this.content = content;
    this.make = () => ({
        name: 'i',
        children: makeContent(this.content),
    });
    this.html = () => `<i>${contentToHtml(this.content)}</i>`;
}

/**
 * Link element
 * @param {string} href Reference
 * @param {string} text Link text
 * @param {string} [hint] Tooltip
 */
function Link(href, text, hint) {
    this.href = href;
    this.text = text;
    this.hint = hint;

    this.make = () => {
        const result = {
            name: 'a',
            props: { href: this.href },
            children: [this.text],
        };
        if (this.hint) {
            result.props.title = this.hint;
        }
        return result;
    };

    this.html = () => this.hint
        ? `<a href="${this.href}" title="${this.hint}">${this.text}</a>`
        : `<a href="${this.href}">${this.text}</a>`;
}

/**
 * Header element
 * @param {number} level Header level
 * @param {InlineElement[]} content Content
 */
function Header(level, content) {
    this.level = level;
    this.content = content;

    this.make = () => ({
        name: `h${this.level}`,
        children: makeContent(this.content),
    });

    this.html = () => `<h${this.level}>${contentToHtml(this.content)}</h${this.level}>`;
}

/**
 * List item
 * @param {InlineElement[]} content Content
 */
function ListItem(content) {
    this.content = content;

    this.make = () => ({
        name: 'li',
        children: makeContent(this.content),
    });

    this.html = () =>  `<li>${contentToHtml(this.content)}</li>`;
}

/**
 * Ordered list element
 * @param {ListItem[]} items List items
 */
function OrderedList(items) {
    this.items = items;
    this.make = () => ({
        name: 'ol',
        children: makeContent(this.items),
    });

    this.html = () =>  `<ol>${contentToHtml(this.items)}</ol>`;
}

/**
 * Unordered list element
 * @param {ListItem[]} items List items
 */
function UnorderedList(items) {
    this.items = items;
    this.make = () => ({
        name: 'ul',
        children: makeContent(this.items),
    });
    this.html = () =>  `<ul>${contentToHtml(this.items)}</ul>`;
}

/**
 * Paragraph
 * @param {InlineElement[]} content Content
 */
function Paragraph(content) {
    this.content = content;
    this.make = () => ({
        name: 'p',
        children: makeContent(this.content)
    });
    this.html = () =>  `<p>${contentToHtml(this.content)}</p>`;
}

module.exports = {
    Text,
    Bold,
    Italic,
    Link,
    Header,
    ListItem,
    OrderedList,
    UnorderedList,
    Paragraph,
};
