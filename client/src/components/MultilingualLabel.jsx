// Renders a form label in English (primary) with Shona and Ndebele beneath it.
//
// Accessibility note: the Shona/Ndebele line is aria-hidden. Concatenating
// three languages into one accessible name produces garbled screen-reader
// output, because the reader applies a single pronunciation engine to all of
// it. Sighted users see all three languages; assistive tech gets one clean
// English name. The required state is conveyed by the input's own `required`
// attribute, not by the visual asterisk (which is also aria-hidden).

export function MultilingualLabel({ htmlFor, labels, required = false, className = '' }) {
  if (!labels) return null;

  return (
    <label htmlFor={htmlFor} className={`multilingual-label ${className}`.trim()}>
      <span className="label-primary">
        {labels.en}
        {required && (
          <span className="label-required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </span>
      <span className="label-translations" aria-hidden="true">
        {labels.sn} · {labels.nd}
      </span>
    </label>
  );
}

export default MultilingualLabel;
