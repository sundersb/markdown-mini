'use strict';

const { expect } = require('chai');
const testee = require('./markdown');

describe('Lib', () => {
    describe('Markdown', () => {
        it('Complex check', () => {
            const text = `
# Lorem ipsum

Lorem ipsum dolor sit amet, consectetur adipiscing elit,

sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

* Ut enim ad minim veniam,
*  quis nostrud exercitation ullamco

1. laboris nisi ut aliquip ex ea commodo consequat.
1. Duis aute irure dolor in reprehenderit
1.  in voluptate velit esse cillum dolore

eu [fugiat](nulla pariatur). Excepteur *sint* occaecat cupidatat **non proident**,

sunt in culpa qui officia deserunt mollit anim id est laborum.

            `;

            const expected = [
                {
                    name: 'h1',
                    children: [ 'Lorem ipsum' ]
                },
                {
                    name: 'p',
                    children: [ 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,' ]
                },
                {
                    name: 'p',
                    children: [ 'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' ]
                },
                {
                    name: 'ul',
                    children: [
                        { name: 'li', children: ['Ut enim ad minim veniam,'] },
                        { name: 'li', children: ['quis nostrud exercitation ullamco'] },
                    ]
                },
                {
                    name: 'ol',
                    children: [
                        { name: 'li', children: ['laboris nisi ut aliquip ex ea commodo consequat.'] },
                        { name: 'li', children: ['Duis aute irure dolor in reprehenderit'] },
                        { name: 'li', children: ['in voluptate velit esse cillum dolore'] },
                    ]
                },
                {
                    name: 'p',
                    children: [
                        'eu ',
                        {
                            name: 'a',
                            props: { href: 'nulla', title: 'pariatur' },
                            children: ['fugiat']
                        },
                        '. Excepteur ',
                        { name: 'i', children: ['sint'] },
                        ' occaecat cupidatat ',
                        { name: 'b', children: ['non proident'] },
                        ',',
                    ]
                },
                {
                    name: 'p',
                    children: ['sunt in culpa qui officia deserunt mollit anim id est laborum.']
                }
            ];

            const actual = testee.parseMarkdown(text);

            expect(actual).deep.equal(expected);
        });

        it('Link', () => {
            const tests = [
                {
                    text: '[title](href)',
                    expected: { name: 'a', props: { href: 'href'}, children: ['title']},
                    rest: ''
                },
                {
                    text: '[title](href)go on',
                    expected: { name: 'a', props: { href: 'href'}, children: ['title']},
                    rest: 'go on'
                },
                {
                    text: '[title](href tooltip)',
                    expected: { name: 'a', props: { href: 'href', title: 'tooltip' }, children: ['title']},
                    rest: ''
                },
                {
                    text: '[title](href "quoted tooltip")',
                    expected: { name: 'a', props: { href: 'href', title: 'quoted tooltip' }, children: ['title']},
                    rest: ''
                },
                {
                    text: '[title](href tooltip with spaces)',
                    expected: { name: 'a', props: { href: 'href', title: 'tooltip with spaces' }, children: ['title']},
                    rest: ''
                },
                {
                    text: '[Complex title](http://www.server.org/path tooltip with spaces) go on',
                    expected: { name: 'a', props: { href: 'http://www.server.org/path', title: 'tooltip with spaces' }, children: ['Complex title']},
                    rest: ' go on'
                },
                {
                    text: '[text] go on',
                    expected: undefined,
                    rest: undefined
                },
                {
                    text: '[text](bad link',
                    expected: undefined,
                    rest: undefined
                }
            ];

            for (const { text, expected, rest } of tests) {
                const actual = testee.linkParser.parseText(text);

                if (expected) {
                    expect(actual).is.not.empty;
                    expect(actual.rest).to.equal(rest);
                    expect(actual.parsed.make()).deep.equal(expected);
                } else {
                    expect(actual).to.be.undefined;
                }
            }
        });

        it('Italic', () => {
            const tests = [
                {
                    text: '*italic*',
                    expected: { name: 'i', children: ['italic']},
                    rest: ''
                },
                {
                    text: '*italic with [link](href)*',
                    expected: { name: 'i', children: ['italic with ', { name: 'a', props: {href: 'href'}, children: ['link']}]},
                    rest: ''
                },
                {
                    text: '*italic* go on',
                    expected: { name: 'i', children: ['italic']},
                    rest: ' go on'
                },
                {
                    text: '*not italic',
                    expected: undefined,
                    rest: undefined
                },
            ];

            for (const { text, expected, rest } of tests) {
                const actual = testee.italicParser.parseText(text);

                if (expected) {
                    expect(actual).is.not.empty;
                    expect(actual.rest).to.equal(rest);
                    expect(actual.parsed.make()).deep.equal(expected);
                } else {
                    expect(actual).to.be.undefined;
                }
            }
        });

        it('Bold', () => {
            const tests = [
                {
                    text: '**bold**',
                    expected: { name: 'b', children: ['bold']},
                    rest: ''
                },
                {
                    text: '**bold *italic***',
                    expected: { name: 'b', children: ['bold ', { name: 'i', children: ['italic']}]},
                    rest: ''
                },
                {
                    text: '***italic* bold**',
                    expected: { name: 'b', children: [{ name: 'i', children: ['italic']}, ' bold']},
                    rest: ''
                },
                {
                    text: '**bold *italic* bold**',
                    expected: { name: 'b', children: ['bold ', { name: 'i', children: ['italic']}, ' bold']},
                    rest: ''
                },
                {
                    text: '**[link](href) bold**',
                    expected: { name: 'b', children: [{ name: 'a', props: {href: 'href'}, children: ['link']}, ' bold']},
                    rest: ''
                },
                {
                    text: '**bold [link](href)**',
                    expected: { name: 'b', children: ['bold ', { name: 'a', props: {href: 'href'}, children: ['link']}]},
                    rest: ''
                },
                {
                    text: '**bold [link](href) bold**',
                    expected: { name: 'b', children: ['bold ', { name: 'a', props: {href: 'href'}, children: ['link']}, ' bold']},
                    rest: ''
                },
                {
                    text: '**bold *italic [link](href)* bold**',
                    expected: {
                        name: 'b',
                        children: [
                            'bold ',
                            {
                                name: 'i',
                                children: [
                                    'italic ',
                                    { name: 'a', props: { href: 'href' }, children: ['link'] }
                                ]
                            },
                            ' bold'
                        ]
                    },
                    rest: ''
                },
                {
                    text: '**bold** go on',
                    expected: { name: 'b', children: ['bold']},
                    rest: ' go on'
                },
            ];

            for (const { text, expected, rest } of tests) {
                const actual = testee.boldParser.parseText(text);

                if (expected) {
                    expect(actual).is.not.empty;
                    expect(actual.rest).to.equal(rest);
                    expect(actual.parsed.make()).deep.equal(expected);
                } else {
                    expect(actual).to.be.undefined;
                }
            }
        });

        it('Header', () => {
            const tests = [
                {
                    text: '# Header1',
                    expected: { name: 'h1', children: ['Header1']},
                    rest: ''
                },
                {
                    text: '## Header2',
                    expected: { name: 'h2', children: ['Header2']},
                    rest: ''
                },
                {
                    text: 'Defected Header',
                    expected: undefined,
                    rest: undefined
                },
                {
                    text: '# Header1\n\ngo on',
                    expected: { name: 'h1', children: ['Header1']},
                    rest: '\n\ngo on'
                },
            ];

            for (const { text, expected, rest } of tests) {
                const actual = testee.headerParser.parseText(text);

                if (expected) {
                    expect(actual).is.not.empty;
                    expect(actual.rest).to.equal(rest);
                    expect(actual.parsed.make()).deep.equal(expected);
                } else {
                    expect(actual).to.be.undefined;
                }
            }
        });

        it('Unordered list', () => {
            const text = '* First\n*   Second\n* *Third* item';
            const expected = {
                name: 'ul',
                children: [
                    { name: 'li', children: ['First'] },
                    { name: 'li', children: ['Second'] },
                    {
                        name: 'li',
                        children: [
                            { name: 'i', children: ['Third'] },
                            ' item'
                        ]
                    },
                ]
            };
            const actual = testee.unorderedParser.parseText(text);

            expect(actual).to.be.not.empty;

            expect(actual.parsed.make()).deep.equal(expected);
        });

        it('Ordered list', () => {
            const text = '1. First\n11111.   Second\n2. *Third* item';
            const expected = {
                name: 'ol',
                children: [
                    { name: 'li', children: ['First'] },
                    { name: 'li', children: ['Second'] },
                    {
                        name: 'li',
                        children: [
                            { name: 'i', children: ['Third'] },
                            ' item'
                        ]
                    },
                ]
            };
            const actual = testee.orderedParser.parseText(text);

            expect(actual).to.be.not.empty;

            expect(actual.parsed.make()).deep.equal(expected);
        });
    });
});
