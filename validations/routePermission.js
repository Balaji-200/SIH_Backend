// User model
const User = require("../models/UserModel");

// RoutePermission Model 
const RoutePermission = require("../models/RoutePermissionModel")

const validatePermission = async (req, res, next) => {
    try {
        let userPermissions = []
        let reqRoute = req.originalUrl
        const route = await RoutePermission.findOne({ route: reqRoute })
        await route.populate({
            path: 'permissions',
            select: 'name',
        })
        let routePermissions = route.permissions.name
        console.log(routePermissions)

        let id = req.userId
        const userDetails = await User.findOne({ _id: id }, { "_id": 1, "roles": 0, "verified": 0, "__v": 0, "password": 0 })
        const user = await User.findById({ _id: userDetails._id })
        await user.populate({
            path: 'roles',
            populate:
            {
                path: 'permissions',
                select: 'name',
            }
        })

        // const userPermission = user.roles[0].permissions[0]
        for (let j in user.roles) {
            for (let k in user.roles[j].permissions) {
                userPermissions.push(user.roles[j].permissions[k].name)
            }
        }
        console.log(userPermissions)
        if (userPermissions.includes(routePermissions)) {
            console.log("success")
            next();
            return;
        }
        else {
            console.log("error occurred")
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = validatePermission