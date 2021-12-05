import Route from 'polka'
import skema from '../middlewares/skema.js'

const route = Route

export default route

route.post('/', skema())


