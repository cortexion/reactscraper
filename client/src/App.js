import React from 'react';
import loading from './loading.gif';
import './App.css';
import Area from './components/Area';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";

function App() {
  React.useEffect(() => {
    Promise.all([getProducts('keski-suomi'), getProducts('uusimaa'), getProducts('varsinais-suomi')]).then(function (values) {
      setKsItems(values[0]);
      setUmItems(values[1]);
      setVsItems(values[2]);
      setDoneLoading(true);
    }, reason => {
      console.error(reason.message); // Error!
    });
    return () => {
      console.log("This will be logged on unmount");
    }
  }, [])

  const getProducts = async (areaName) => {
    try {
      const res = await fetch('/tori/' + areaName);
      if (!res.ok) {
        //setItem(null)
        throw new Error("Fetch was not OK");
      }
      const json = await res.json();
      return json
    } catch (error) {
      //alert(`Error fetching or parsing data: ${error}`);
    }
  };

  const [doneLoading, setDoneLoading] = React.useState(false);
  const [KsItems, setKsItems] = React.useState(false);
  const [UmItems, setUmItems] = React.useState(false);
  const [VsItems, setVsItems] = React.useState(false);

  return (
    <div className="wrapper">
      <div style={{
        border: '0px solid black', height: '60px', background: 'lavender', backgroundRepeat: 'no-repeat',
        backgroundPosition: '10px', borderRadius: '5px', border: '1px solid lightGray'
      }}>
        <small style={{ margin: '0px', padding: '5px' }}>(Made by EA)</small>
      </div>
      <h1>Valitse alue, miltä haluat etsiä ilmaista tavaraa:</h1>
      <nav>
        <ul style={{ padding: '0px' }}>
          {doneLoading ? <div style={{ paddingLeft: '15px' }}>
            <li><Link to="/keski-suomi">Keski-Suomi</Link></li>
            <li><Link to="/uusimaa">Uusimaa</Link></li>
            <li><Link to="/varsinais-suomi">Varsinais-Suomi</Link></li>
            <Routes>
              <Route
                path="/"
                element={<Area
                  areaName='Keski-Suomi'
                  items={KsItems}
                  setItems={setKsItems}
                />} />
            </Routes>
          </div> : <div style={{ border: '1px solid lightGray', height: '130px', maxWidth: '800px' }}>
            <img src={loading} alt='loading' style={{ height: '130px', width: '130px', display: 'block', margin: 'auto' }} />
          </div>}
        </ul>
      </nav>
      <Routes>
        <Route
          path="/keski-suomi"
          element={<Area
            areaName='Keski-Suomi'
            items={KsItems}
            setItems={setKsItems}
          />} />
        <Route
          path="/uusimaa"
          element={<Area
            areaName='Uusimaa'
            items={UmItems}
            setItems={setUmItems}
          />} />
        <Route
          path="/varsinais-suomi"
          element={<Area
            areaName='Varsinais-Suomi'
            items={VsItems}
            setItems={setVsItems}
          />} />
      </Routes>
    </div>
  );
}

export default App;
