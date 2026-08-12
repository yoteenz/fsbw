type LearnLikesFilterContentProps = {
  selected: boolean;
};

/** Text label for LIKES filter pill — panel cards use the heart control separately. */
export function LearnLikesFilterContent({ selected: _selected }: LearnLikesFilterContentProps) {
  return <span>LIKES</span>;
}

export function renderLearnLikesFilterContent(filter: string, selected: boolean) {
  if (filter === 'LIKES') {
    return <LearnLikesFilterContent selected={selected} />;
  }
  return filter;
}
