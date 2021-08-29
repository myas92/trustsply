const joi_validator = require("./joi-validator")
// @ponicode
describe("joi_validator.validator", () => {
    test("0", () => {
        let callFunction = () => {
            joi_validator.validator("invoice transaction at O'Connell, Beahan and Gerhold using card ending with ***6715 for ARS 840.46 in account ***86953668", "Anas")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            joi_validator.validator("invoice transaction at Larkin Inc using card ending with ***8987 for GHS 889.84 in account ***54986018", "Edmond")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            joi_validator.validator("invoice transaction at O'Connell, Beahan and Gerhold using card ending with ***6715 for ARS 840.46 in account ***86953668", "Pierre Edouard")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            joi_validator.validator("withdrawal transaction at Kovacek Inc using card ending with ***6291 for IRR 718.83 in account ***77705372", "George")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            joi_validator.validator("invoice transaction at Larkin Inc using card ending with ***8987 for GHS 889.84 in account ***54986018", "Pierre Edouard")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            joi_validator.validator(undefined, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})
