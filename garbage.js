import React from 'react';
import FeedBox from '../Components/Custom/FeedBox';
import Adapter from 'enzyme-adapter-react-16';
import {shallow,mount,configure} from 'enzyme';

let wrapper;

configure({adapter: new Adapter()});

beforeEach(() =>{
    var uid = "gbfBtH1XbDMYice2pM0zV7caEjn2";
    var feeds = ["3spUxvoom9PAiWy6UA9o"];
    wrapper = shallow(
        <FeedBox uid={uid} feeds = {feeds} />);   
});

it('should render feedbox correctly' , async () => {
   expect(wrapper).toMatchSnapshot();
})

//

import React from 'react';
import StarButton from '../Components/Buttons/StarButton';
import Adapter from 'enzyme-adapter-react-16';
import {shallow,mount,configure} from 'enzyme';

let wrapper;

configure({adapter: new Adapter()});

beforeEach(() =>{
    var uid = "gbfBtH1XbDMYice2pM0zV7caEjn2";
    var pid = "0dyQVP3GOGDKeMxuEBuA";
    wrapper = shallow(
        <StarButton  pid={pid} uid={uid}/>);   
});

it('should render starbutton correctly' , async () => {
   expect(wrapper).toMatchSnapshot();
})

it('should set starbutton state correctly' , async () => {  //tests that photobox is shown 
    expect(wrapper.state('favorite')).toBeFalsy();
})