import React from 'react';
import './App.css';
import { test } from './TypedForm'

function App() {
  const Test = () => test()
  return (
    <div>
      <Test />
    </div>
  );
}

export default App;
