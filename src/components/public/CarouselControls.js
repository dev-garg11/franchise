import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CarouselControls({ onPrevious, onNext, label = "carousel" }) {
  return (
    <div className="public-carousel-controls" aria-label={`${label} controls`}>
      <button type="button" onClick={onPrevious} aria-label={`Previous ${label}`}><ChevronLeft size={18} /></button>
      <button type="button" onClick={onNext} aria-label={`Next ${label}`}><ChevronRight size={18} /></button>
    </div>
  );
}
