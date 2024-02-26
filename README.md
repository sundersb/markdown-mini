# `markdown-mini` Readme

Simple markdown to HTML converter

## Features

This is not a complete Markdown implementation. General purpose - quick and small parsing in places when no special need for full Markdown syntax exists. For instance, an item description in a e-store.

What is supported:

* Headers,
* Ordered/unordered lists with no nesting,
* Bold, italic,
* URL inks.

## Installation

Run the following command:

~~~sh
npm install --save @sundersb/markdown-mini
~~~

## Example

~~~js
const { markdownToHtml } = require('@sundersb/markdown-mini');

const md = `# Lorem ipsum dolor sit amet

Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

* Ut enim ad minim veniam,
* Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute **irure dolor** in reprehenderit in voluptate velit esse *cillum dolore* eu fugiat nulla pariatur. Excepteur [sint occaecat](http://www.example.com) cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`;

const html = markdownToHtml(md);
~~~
