type DatasetTagsProps = {
  tags: string[];
};

export default function DatasetTags({ tags }: DatasetTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-radius-full bg-primary-light px-3 py-1 font-sarabun text-label font-medium text-primary-dark"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
