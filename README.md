# postcss-sass-each

A [PostCSS] plugin to iterate through values.
Inspired and based on [postcss-each](https://github.com/outpunk/postcss-each).
Support usage [postcss-simple-vars](https://github.com/postcss/postcss-simple-vars) before this plugin and sass-like `@each`;

[PostCSS]: https://github.com/postcss/postcss

Iterate through values:

```css
@each icon in foo, bar, baz {
  .icon-#(icon) {
    background: url('icons/#(icon).png');
  }
}
```

```css
.icon-foo {
  background: url('icons/foo.png');
}

.icon-bar {
  background: url('icons/bar.png');
}

.icon-baz {
  background: url('icons/baz.png');
}
```

Iterate through values with index (auto add `index` variable):

```css
@each val in foo, bar {
  .icon-#(val) {
    background: url("#(val)_#(index).png");
  }
}
```

```css
.icon-foo {
  background: url("foo_0.png");
}

.icon-bar {
  background: url("bar_1.png");
}
```

Iterate through lists with multiple variables delimited with colon:

```css
@each animal, color in (puma: black, sea-slug: blue) {
  .#(animal)-icon {
    background-image: url('/images/$(animal).png');
    border: 2px solid #(color);
  }
}
```

```css
.puma-icon {
  background-image: url('/images/puma.png');
  border: 2px solid black;
}
.sea-slug-icon {
  background-image: url('/images/sea-slug.png');
  border: 2px solid blue;
}
```

## Usage

```js
postcss([ require('postcss-sass-each') ])
```

### Options

#### `plugins`

Type: `object`  
Default: `{}`

Accepts two properties: `afterEach` and `beforeEach`

#### `afterEach`

Type: `array`
Default: `[]`

Plugins to be called after each iteration

#### `beforeEach`

Type: `array`
Default: `[]`

Plugins to be called before each iteration

```javascript
require('postcss-sass-each')({
  plugins: {
    afterEach: [
      require('postcss-at-rules-variables')
    ],
    beforeEach: [
      require('postcss-custom-properties')
    ]
  }
})
```


See [PostCSS] docs for examples for your environment.
