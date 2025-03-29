const SliceText = ({ text, x, y, rotation, sliceAngle }) => {
  // Improved font size calculation
  let fontSize;
  if (sliceAngle === 360) {
    fontSize = '4.5'; // Larger font for full circle near border
  } else if (sliceAngle > 45) {
    fontSize = '4'; // Larger font for bigger slices
  } else {
    fontSize = '3.5'; // Larger font for smaller slices
  }

  // Break text into multiple lines if needed
  const words = text.split(' ');

  // Common text attributes
  const textProps = {
    x,
    y,
    textAnchor: 'middle',
    dominantBaseline: 'middle',
    fontSize,
    fontWeight: 'bold',
    transform: `rotate(${rotation}, ${x}, ${y})`,
    stroke: 'white',
    strokeWidth: '0.5',
    fill: 'black',
    paintOrder: 'stroke',
  };

  // For normal display
  if (!(words.length > 1 && sliceAngle < 45 && sliceAngle !== 360)) {
    return (
      <text {...textProps}>
        <title>{text}</title>
        {text}
      </text>
    );
  }

  // For text that needs to be broken into multiple lines
  const midpoint = Math.ceil(words.length / 2);

  return (
    <text {...textProps}>
      <title>{text}</title>
      <tspan x={x} dy="-0.6em">
        {words.slice(0, midpoint).join(' ')}
      </tspan>
      <tspan x={x} dy="1.2em">
        {words.slice(midpoint).join(' ')}
      </tspan>
    </text>
  );
};

export default SliceText;
