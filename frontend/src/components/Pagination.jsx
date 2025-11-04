export default function Pagination({ page, limit, total, onPage }) {
  const pageCount = Math.max(1, Math.ceil(total / limit));

  function prev() {
    if (page > 1) onPage(page - 1);
  }

  function next() {
    if (page < pageCount) onPage(page + 1);
  }

  return (
    <div className="spread mt-16">
      <button className="button" onClick={prev} disabled={page <= 1}>
        ← Précédent
      </button>

      <div className="subtle">
        Page {page} / {pageCount} • {total} éléments
      </div>

      <button className="button" onClick={next} disabled={page >= pageCount}>
        Suivant →
      </button>
    </div>
  );
}
