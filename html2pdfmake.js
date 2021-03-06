/* remove jQuery code from https://github.com/ymkins/html2pdfmake */
var html2pdfmake = function(html) {
  var content = [];
  ParseHtml(content, html);
  return content;


  function ParseContainer(cnt, e, p, styles) {
    var elements = [];
    var children = e.childNodes;
    if (children.length !== 0) {
      for (var i = 0; i < children.length; i++) {
        p = ParseElement(elements, children[i], p, styles);
      }
    }
    if (elements.length !== 0) {
      for (var i = 0; i < elements.length; i++) {
        cnt.push(elements[i]);
      }
    }
    return p;
  }

  function ComputeStyle(o, styles) {
    for (var i = 0; i < styles.length; i++) {
      var st = styles[i].trim().toLowerCase().split(':');
      if (st.length === 2) {
        st[0] = st[0].trim();
        st[1] = st[1].trim();
        switch (st[0]) {
          case 'font-size':
            o.fontSize = parseInt(st[1]);
            break;
          case 'text-align':
            switch (st[1]) {
              case 'right':
                o.alignment = 'right';
                break;
              case 'center':
                o.alignment = 'center';
                break;
            }
          break;
          case 'font-weight':
            switch (st[1]) {
              case 'bold':
                o.bold = true;
                break;
            }
            break;
          case 'text-decoration':
            switch (st[1]) {
              case 'underline':
                o.decoration = 'underline';
                break;
            }
          break;
          case 'font-style':
            switch (st[1]) {
              case 'italic':
                o.italics = true;
                break;
            }
            break;
        }
      }
    }
  }

  function ParseElement(cnt, e, p, styles) {
    styles = styles || [];
    if (e.getAttribute) {
      var nodeStyle = e.getAttribute('style');
      if (nodeStyle) {
        var ns = nodeStyle.split(';');
        for (var k = 0; k < ns.length; k++) {
          styles.push(ns[k]);
        }
      }
    }

    switch (e.nodeName.toLowerCase()) {
      case '#text':
        var t = {
          text: e.textContent.replace(/\n/g, '')
        };
        if (styles) {
          ComputeStyle(t, styles);
        }
        p.text.push(t);
        break;
      case 'b':
      case 'strong':
        ParseContainer(cnt, e, p, styles.concat(['font-weight:bold']));
        break;
      case 'u':
        ParseContainer(cnt, e, p, styles.concat(['text-decoration:underline']));
        break;
      case 'i':
        ParseContainer(cnt, e, p, styles.concat(['font-style:italic']));
        break;
      case 'span':
        ParseContainer(cnt, e, p, styles);
        break;
      case 'br':
        p = CreateParagraph();
        cnt.push(p);
      break;
      case 'table':
        var t = {
          table: {
            widths: [],
            body: []
          }
        };
        var border = e.getAttribute('data-pdfmake-layouts');
        var layouts = ['noBorders', 'headerLineOnly', 'lightHorizontalLines'];
        if (layouts.indexOf(border) > -1) {
          t.layout = border;
        }
        ParseContainer(t.table.body, e, p, styles);

        var widths = e.getAttribute('data-pdfmake-widths');
        if (!widths) {
          if (t.table.body.length !== 0) {
            if (t.table.body[0].length !== 0) {
              for (var k = 0; k < t.table.body[0].length; k++) {
                t.table.widths.push('*');
              }
            }
          }
        } else {
          var w = widths.split(/[\s,]+/);
          for (var k = 0; k < w.length; k++) {
            t.table.widths.push(w[k]);
          }
        }
        cnt.push(t);
        break;
      case 'thead':
      case 'tbody':
        ParseContainer(cnt, e, p, styles);
        break;
      case 'tr':
        var row = [];
        ParseContainer(row, e, p, styles);
        cnt.push(row);
        break;
      case 'th':
      case 'td':
        p = CreateParagraph();
        var st = {
          stack: []
        };
        st.stack.push(p);

        var rspan = e.getAttribute('rowspan');
        if (rspan) {
          st.rowSpan = parseInt(rspan);
        }
        var cspan = e.getAttribute('colspan');
        if (cspan) {
          st.colSpan = parseInt(cspan);
        }

        ParseContainer(st.stack, e, p, styles);
        cnt.push(st);
        if (cspan) {
          for (var i=0; i<st.colSpan-1; i++) cnt.push({});
        }
        break;
      case 'div':
      case 'li':
      case 'p':
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        p = CreateParagraph();
        var st = {
          stack: []
        };
        st.stack.push(p);
        ComputeStyle(st, styles);
        ParseContainer(st.stack, e, p);

        cnt.push(st);
        break;
      case 'ul':
        var ul = {
          ul: []
        };
        ParseContainer(ul.ul, e, p, styles);
        cnt.push(ul);
        break;
      case 'ol':
        var ul = {
          ol: []
        };
        ParseContainer(ul.ol, e, p, styles);
        cnt.push(ul);
        break;
      default:
        //console.log('#html2pdfmake', 'Parsing for node ' + e.nodeName + ' not found');
        break;
    }
    return p;
  }

  function ParseHtml(cnt, htmlText) {
    var p = CreateParagraph();
    var div = document.createElement('div');
    if (typeof htmlText === "string") div.insertAdjacentHTML('beforeend', htmlText);
    else if (htmlText instanceof Element) {
      div.insertAdjacentElement('beforeend', htmlText.cloneNode(true));
    }
    [].forEach.call(div.childNodes, function(content) {
      if (content.nodeName.toLowerCase() === '#text') {
        var tmp = document.createElement('p');
        tmp.appendChild(content);
        content = tmp;
      }
      ParseElement(cnt, content, p);
    });
  }

  function CreateParagraph() {
    var p = {
      text: []
    };
    return p;
  }
};
