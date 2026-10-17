type Props = { subtitle: string };

const SummaryHeader = ({ subtitle }: Props) => {
  return (
    <section>
      <header className="top">
        <h1 className="h1">Підсумок</h1>
        <p className="p">{subtitle}</p>
      </header>
    </section>
  );
};

export default SummaryHeader;
