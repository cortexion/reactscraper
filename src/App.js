import React from 'react';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import loading from './loading.gif';
import './App.css';
import Area from './components/Area';

function App() {
	React.useEffect(() => {
		return Promise.all([getProducts('keski-suomi'), getProducts('pirkanmaa'), getProducts('varsinais-suomi')]).then(function(values) {
			setKsItems(values[0]);
			setPmItems(values[1]);
			setVsItems(values[2]);
			//console.log(values)
			setDoneLoading(true);
		 }, reason => {
			console.error(reason.message); // Error!
		});
		
	}, [])
	
	const getProducts = async (areaName) => {
		try {
			const res = await fetch('/tori/'+areaName);
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
	const [PmItems, setPmItems] = React.useState(false);
	const [VsItems, setVsItems] = React.useState(false);
	
  return (
      <div className="wrapper">
	  <div style={{border: '0px solid black', height: '60px', background: 'lavender', backgroundRepeat: 'no-repeat',
	backgroundPosition: '10px', borderRadius: '5px', border: '1px solid lightGray'}}>
	<small style={{margin: '0px', padding: '5px'}}>(Made by EA)</small>
	</div>	  
      <h1>Valitse alue, miltä haluat etsiä ilmaista tavaraa:</h1>
      <BrowserRouter>
        <nav>
          <ul style={{padding: '0px'}}>
		  { doneLoading ? <div style={{paddingLeft: '15px'}}>
			<li><Link to="/keski-suomi">Keski-Suomi</Link></li>
            <li><Link to="/pirkanmaa">Pirkanmaa</Link></li>
			<li><Link to="/varsinais-suomi">Varsinais-Suomi</Link></li>
		  </div> : <div style={{border: '1px solid lightGray', height: '130px', maxWidth: '800px'}}>
			<img src={loading} style={{height: '130px', width: '130px', display: 'block', margin: 'auto'}}/>
		  </div> }
          </ul>
        </nav>
        <Switch>
		<Route exact path="/">
            { doneLoading ? <Area areaName='Keski-Suomi' items={KsItems} setItems={setKsItems} /> : '' }
		</Route>
		<Route
		path="/keski-suomi"
		render={() => (
		<Area
		areaName='Keski-Suomi'
		items={KsItems}
		setItems={setKsItems}
		/>
		)}/>
		<Route
		path="/pirkanmaa"
		render={() => (
		<Area
		areaName='Pirkanmaa'
		items={PmItems}
		setItems={setPmItems}
		/>
		)}/>
		<Route
		path="/varsinais-suomi"
		render={() => (
		<Area
		areaName='Varsinais-Suomi'
		items={VsItems}
		setItems={setVsItems}
		/>
		)}/>
          {/*<Route path="/main">
            <Main />
          </Route>*/}
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
