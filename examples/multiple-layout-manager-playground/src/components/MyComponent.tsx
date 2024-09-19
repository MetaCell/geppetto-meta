import { FC } from 'react';

// Define the props type for MyComponent
type MyComponentProps = {
    name: string;
    color: string;
};

// Define MyComponent as a functional component
const MyComponent: FC<MyComponentProps> = ({ name, color }) => {
  return <h1 style={{ width: "100%", backgroundColor: color }}>{name}</h1>;
};

export default MyComponent;