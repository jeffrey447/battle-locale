import { LOGIN_USER, SET_PLAYER_COORDS } from './types';
import { replace } from 'connected-react-router';

export const setPlayerCoords = (name, lat, long) => async dispatch => {
  console.log('setting Player Coords');
  console.log(lat);
  console.log(long);
  // Make POST request
  dispatch({
    type: SET_PLAYER_COORDS,
    payload: {
      lat: lat,
      long: long
    }
  });
}

export const loginUser = (name) => async dispatch => {
  console.log('logging in' + name);
  const response = await fetch('https://battle-locale.herokuapp.com/api/users/login', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name
    }),
  });

    const data = await response.json();
    console.log(data);
    if (!data) throw new Error('Empty response from server');
    if (data.error) throw new Error(data.error.message);

  dispatch({
    type: LOGIN_USER,
    payload: {
      name: name
    }
  });
  dispatch(replace('/queue'));
}