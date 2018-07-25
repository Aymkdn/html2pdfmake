# html2pdfmake

Extension for [pdfmake](https://github.com/bpampuch/pdfmake) that permits to transform HTML code to *pdfmake* syntax.

## Install

Just call the file in `script` tag:
```html
<script src="html2pdfmake.js"></script>
```

If you want to **use with NodeJS**, then replace `var html2pdfmake = function(html) {` by `export default function(html) {` and then call `import html2pdfmake from './html2pdfmake.js'`.

## Usage

Example:
```html
<table id="example" data-pdfmake-layouts="noBorders" data-pdfmake-widths="50,'*'">
  <tr><th>Header 1</th><th>Header 2</th></tr>
  <tr><td>Cell 1</td><td>Cell 2</td></tr>
</table>

<script>
var defTable = html2pdfmake(document.querySelector('#example'));
var definition = {
  content:[
    'Some text',
    defTable
  ]
};
pdfMake.createPdf(definition).download('test.pdf');
</script>
```
