export const cartMiddleware = store => next => action => {

  if (action.type === 'user/logout') {
    store.dispatch({ type: 'cart/syncCartWithUser', payload: 'logout' });
  }
  
  
  if (action.type === 'user/login') {
    const { userToken } = action.payload;
    // You might want to fetch the user's cart from server here
    // store.dispatch(syncCartWithServer({ items: [], userToken }));
  }
  
  return next(action);
};