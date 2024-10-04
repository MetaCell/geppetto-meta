const MyComponent = ({ name, color }: {name: string, color: string}) => {
  return <h1 style={{ width: "100%", backgroundColor: color }}>{ name }</h1>;
};

export default MyComponent;
