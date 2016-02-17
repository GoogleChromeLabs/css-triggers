export default {
  'l1 p1 c1': `<p>Changing <code>@PROPERTY_NAME@</code>
      alters the geometry of the element. That means that
      it may affect the position or size of other elements
      on the page, both of which require the browser to perform
      <strong class=\"layout\">layout</strong> operations.</p>

      <p>Once those layout operations have completed any damaged
      pixels will need to be <strong class=\"paint\">painted</strong>
      and the page must then be <strong class=\"composite\">composited</strong>
      together.</p>`,

  'l0 p1 c1': `<p>Changing <code>@PROPERTY_NAME@</code>
      does not trigger any geometry changes, which is good. But
      since it is a visual property, it will cause
      <strong class=\"paint\">painting</strong> to occur.
      Painting is typically a super expensive operation, so
      you should be cautious.</p><p>Once any pixels have been
      painted the page will be <strong class=\"composite\">composited</strong>
      together.</p>`,

  'l0 p0 c1': `<p>Changing <code>@PROPERTY_NAME@</code> does
      not trigger any geometry changes or painting, which is very good.
      This means that the operation can likely be carried out by the
      <strong>compositor thread</strong> with the help of the GPU.</p>`,

  'l1 p0 l1': `<p>Changing <code>@PROPERTY_NAME@</code> alters the
      geometry of the element. That means that it may affect the position
      or size of other elements on the page, both of which require the
      browser to perform <strong class=\"layout\">layout</strong>
      operations.</p><p>Once those layout operations have completed
      any damaged pixels will need to be
      <strong class=\"paint\">painted</strong>, although in this case
      not immediately (it doesn't trigger paint) and the page must
      then be <strong class=\"composite\">composited</strong> together.</p>`

};
