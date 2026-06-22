/** Same gray/white/color rings as build-a-wig `ThumbBox` color swatches. */
export function BcfColorSwatchDonut({ colorCode }: { colorCode: string }) {
  return (
    <div
      style={{
        width: '30px',
        height: '30px',
        backgroundColor: '#808080',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '81%',
          height: '81%',
          backgroundColor: '#FFFFFF',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '76%',
            height: '76%',
            backgroundColor: colorCode,
            borderRadius: '50%',
          }}
        />
      </div>
    </div>
  );
}
