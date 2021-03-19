import React from 'react'

import { Switch, Route} from 'react-router-dom'

import SingIn from '../pages/SingIn'

const AuthRoutes: React.FC = () => (
    <Switch>
        <Route path="/" component={SingIn}/>
    </Switch>
)

export default AuthRoutes