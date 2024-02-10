import './Dropdown.css';

const Dropdown = (props) => {
    return (
        <div className="dropdown">
            <button className="dropbtn">{props.dropDownSelectText}</button>
            <div className="dropdown-content">
                {props.children}
            </div>
        </div>
    );
};

export { Dropdown };
