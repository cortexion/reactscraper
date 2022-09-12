import React from 'react';

const Area = ({ areaName, items, setItems }) => {
    React.useEffect(() => {
        if (items) {
            setProducts(items);
        }
        setCurrentArea(areaName);

        return () => { }
    }, [areaName, items])

    const [currentArea, setCurrentArea] = React.useState('');
    const [products, setProducts] = React.useState([]);

    return (<div>
        <h2 style={{ marginBottom: '0px' }}>{currentArea}</h2>
        <p style={{ margin: '0px' }}>Viimeisimmät 5 tavaraa:</p>
        {products.map((product, idx) => {
            return (
                <div key={idx}>
                    <div>
                        <div className="row" style={{ marginTop: '15px' }}>
                            <div className="col" style={{ height: '170px', maxWidth: '800px', padding: '5px', borderLeft: '1px solid lightGray', borderRight: '1px solid lightGray', borderTop: '1px solid lightGray', backgroundColor: '#f2f2f2', boxShadow: '1px 1px 4px #808080', marginBottom: '5px' }}>
                                <a href={product.url}>
                                    <div style={{ display: 'inline-block', border: '1px solid black', height: '100px', width: '100px', backgroundImage: "url(" + product.image + ")", backgroundSize: 'contain', backgroundColor: 'gray', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}></div></a>
                                <div style={{ maxWidth: '650px', marginLeft: '10px', display: 'inline-block', position: 'absolute', paddingRight: '30px' }}>
                                    <b>{product.name}</b><br />
                                    <p style={{ margin: '0px', border: '0px solid black', minHeight: '60px', maxHeight: '60px', overflowY: 'scroll' }}>{product.desc}</p>
                                    <a href={product.url}>Linkki sivulle</a>
                                    <p style={{ margin: '0px', display: 'inline', marginLeft: '2px' }}> {product.images.length} kuva(a):</p>
                                </div>

                                <div style={{ marginTop: '5px' }}>
                                    {product.images.map((img, idx) => {
                                        return (
                                            <a href={img} key={idx}><img src={img} alt='product' style={{ marginLeft: '2px', border: '1px solid black', height: '50px', width: '50px', display: 'inline-block' }} /></a>
                                        )
                                    })}
                                </div>

                            </div>
                        </div>
                    </div></div>)
        })}
    </div>);
}

export default Area;
