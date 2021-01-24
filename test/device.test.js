jest.mock('os', () => ({ networkInterfaces: jest.fn() }))
const { LoupedeckDevice } = require('..')
const os = require('os')

expect.extend({
    toBePixelBuffer(received, { displayID, x, y, width, height }) {
        if (received.readUInt16BE(0) !== 0xff10) return { pass: false, message: () => `Header should be 0xff10, found 0x${received.readUInt16BE().toString(16)}` }
        if (received.readUInt16BE(3) !== displayID) return { pass: false, message: () => `Display ID should be ${displayID}, but found 0x${received.readUInt16BE(3).toString(16)}` }
        if (received.readUInt16BE(5) !== x) return { pass: false, message: () => `X coordinate should be ${x}, but found ${received.readUInt16BE(3)}` }
        if (received.readUInt16BE(7) !== y) return { pass: false, message: () => `Y coordinate should be ${y}, but found ${received.readUInt16BE(5)}` }
        if (received.readUInt16BE(9) !== width) return { pass: false, message: () => `Width should be ${width}, but found ${received.readUInt16BE(9)}` }
        if (received.readUInt16BE(11) !== height) return { pass: false, message: () => `Height should be ${height}, but found ${received.readUInt16BE(11)}` }
        const correctLength = 13 + width * height * 2
        if (received.length !== correctLength) return { pass: false, message: () => `Buffer length should be ${correctLength}, but found ${received.length}` }
        return { pass: true }
    }
})

const delay = ms => new Promise(res => setTimeout(res, ms))

let device

describe('Connection', () => {
    it('connects via autodiscovery', async() => {
        os.networkInterfaces.mockReturnValue([{ address: '100.127.80.1' }])
        device = new LoupedeckDevice()
        const fn = jest.fn()
        device.on('connect', fn)
        await delay(60)
        expect(fn).toHaveBeenCalledWith(device)
    })
    it('connects via direct instantiation', async() => {
        device = new LoupedeckDevice({ ip: '127.0.0.1' })
        const fn = jest.fn()
        device.on('connect', fn)
        await device.connect()
        expect(fn).toHaveBeenCalledWith(device)
    })
    it('errors if device not found', async() => {
        os.networkInterfaces.mockReturnValue([])
        device = new LoupedeckDevice({ autoConnect: false })
        await expect(device.connect.bind(device)).rejects.toThrow(/no loupedeck devices found/i)
    })
})

describe('Commands', () => {
    beforeEach(() => {
        device = new LoupedeckDevice({ ip: '255.255.255.255', autoConnect: false })
        device.connection = { send: () => {} }
    })
    it('sets brightness', () => {
        const sender = jest.spyOn(device.connection, 'send')
        device.setBrightness(0)
        expect(sender).toHaveBeenCalledWith(Buffer.from('04090100', 'hex'))
        device.setBrightness(1)
        // 0x0b should be max brightness
        expect(sender).toHaveBeenCalledWith(Buffer.from('0409020b', 'hex'))
    })
    it('sets button color', () => {
        const sender = jest.spyOn(device.connection, 'send')
        device.setButtonColor({ id: '4', color: 'red' })
        expect(sender).toHaveBeenCalledWith(Buffer.from('0702010bff0000', 'hex'))
    })
    it('errors on unknown button passed', () => {
        expect(() => device.setButtonColor({ id: 'triangle', color: 'blue' })).toThrow(/Invalid button/)
    })
    it('writes pixels to left display', () => {
        const sender = jest.spyOn(device.connection, 'send')
        device.drawScreen('left', (ctx, w, h) => {
            ctx.fillStyle = '#f00' // red
            ctx.fillRect(0, 0, w, h)
        })
        // Color format is 5-6-5 16-bit RGB
        // so first 5 bits for full red is 0xf800, or 0x00f8 in LE
        const pixels = '00f8'.repeat(60 * 270)
        expect(sender.mock.calls[0][0]).toBePixelBuffer({ displayID: 0x004c, x: 0, y: 0, width: 60, height: 270 })
        expect(sender.mock.calls[0][0].slice(13).toString('hex')).toEqual(pixels)
        expect(sender).toHaveBeenNthCalledWith(2, Buffer.from('050f02004c', 'hex'))
    })
    it('writes pixels to right display', () => {
        const sender = jest.spyOn(device.connection, 'send')
        device.drawScreen('right', (ctx, w, h) => {
            ctx.fillStyle = '#0f0' // green
            ctx.fillRect(0, 0, w, h)
        })
        // Color format is 5-6-5 16-bit RGB
        // so middle 6 bits for full green is 0x07e0, or 0xe007 in LE
        const pixels = 'e007'.repeat(60 * 270)
        expect(sender.mock.calls[0][0]).toBePixelBuffer({ displayID: 0x0052, x: 0, y: 0, width: 60, height: 270 })
        expect(sender.mock.calls[0][0].slice(13).toString('hex')).toEqual(pixels)
        expect(sender).toHaveBeenNthCalledWith(2, Buffer.from('050f020052', 'hex'))
    })
    it('writes pixels to center display', () => {
        const sender = jest.spyOn(device.connection, 'send')
        device.drawScreen('center', (ctx, w, h) => {
            ctx.fillStyle = '#00f' // blue
            ctx.fillRect(0, 0, w, h)
        })
        // Color format is 5-6-5 16-bit RGB
        // so last 5 bits for full blue is 0x001f, or 0x1f00 in LE
        const pixels = '1f00'.repeat(360 * 270)
        expect(sender.mock.calls[0][0]).toBePixelBuffer({ displayID: 0x0041, x: 0, y: 0, width: 360, height: 270 })
        expect(sender.mock.calls[0][0].slice(13).toString('hex')).toEqual(pixels)
        expect(sender).toHaveBeenNthCalledWith(2, Buffer.from('050f020041', 'hex'))
    })
    it('writes pixels to a specific key area', () => {
        const sender = jest.spyOn(device.connection, 'send')
        device.drawKey(6, (ctx, w, h) => {
            ctx.fillStyle = '#fff'
            ctx.fillRect(0, 0, w, h)
        })
        const pixels = 'ffff'.repeat(90 * 90)
        expect(sender.mock.calls[0][0]).toBePixelBuffer({ displayID: 0x0041, x: 180, y: 90, width: 90, height: 90 })
        expect(sender.mock.calls[0][0].slice(13).toString('hex')).toEqual(pixels)
        expect(sender).toHaveBeenNthCalledWith(2, Buffer.from('050f020041', 'hex'))
    })
    it('vibrates short by default', () => {
        const sender = jest.spyOn(device.connection, 'send')
        device.vibrate()
        expect(sender).toHaveBeenCalledWith(Buffer.from('041b0101', 'hex'))
    })
    it('vibrates a specific pattern', () => {
        const sender = jest.spyOn(device.connection, 'send')
        device.vibrate(0x56)
        expect(sender).toHaveBeenCalledWith(Buffer.from('041b0156', 'hex'))
    })
})

describe('Message Parsing', () => {
    beforeEach(() => {
        device = new LoupedeckDevice({ ip: '255.255.255.255', autoConnect: false })
    })
    it('processes button presses', () => {
        const SAMPLE_MESSAGE = Buffer.from('0500000900', 'hex')
        const fn = jest.fn()
        device.on('down', fn)
        device.onReceive(SAMPLE_MESSAGE)
        expect(fn).toHaveBeenCalledWith({ id: '2' })
    })
    it('processes button releases', () => {
        const SAMPLE_MESSAGE = Buffer.from('0500000701', 'hex')
        const fn = jest.fn()
        device.on('up', fn)
        device.onReceive(SAMPLE_MESSAGE)
        expect(fn).toHaveBeenCalledWith({ id: 'circle' })
    })
    it('processes clockwise knob turns', () => {
        const SAMPLE_MESSAGE = Buffer.from('0501000101', 'hex')
        const fn = jest.fn()
        device.on('rotate', fn)
        device.onReceive(SAMPLE_MESSAGE)
        expect(fn).toHaveBeenCalledWith({ id: 'knobTL', delta: 1 })
    })
    it('processes counter-clockwise knob turns', () => {
        const SAMPLE_MESSAGE = Buffer.from('05010005ff', 'hex')
        const fn = jest.fn()
        device.on('rotate', fn)
        device.onReceive(SAMPLE_MESSAGE)
        expect(fn).toHaveBeenCalledWith({ id: 'knobCR', delta: -1 })
    })
    it('processes initial screen touches', () => {
        const SAMPLE_MESSAGE = Buffer.from('094d0000007300e213', 'hex')
        const fn = jest.fn()
        device.on('touchstart', fn)
        device.onReceive(SAMPLE_MESSAGE)
        expect(fn).toHaveBeenCalledWith(expect.objectContaining({
            changedTouches: [expect.objectContaining({ x: 115, y: 226 })],
        }))
    })
    it('processes touch moves', () => {
        const SAMPLE_MESSAGE = Buffer.from('094d0000007300e215', 'hex')
        const FOLLOW_MESSAGE = Buffer.from('094d0000007000e515', 'hex')
        const fn = jest.fn()
        device.on('touchmove', fn)
        device.onReceive(SAMPLE_MESSAGE)
        device.onReceive(FOLLOW_MESSAGE)
        expect(fn).toHaveBeenCalledWith(expect.objectContaining({
            changedTouches: [expect.objectContaining({ x: 112, y: 229 })],
        }))
    })
    it('processes screen touchends', () => {
        const SAMPLE_MESSAGE = Buffer.from('096d000001bf004c12', 'hex')
        const fn = jest.fn()
        device.on('touchend', fn)
        device.onReceive(SAMPLE_MESSAGE)
        expect(fn).toHaveBeenCalledWith({
            touches: [],
            changedTouches: [expect.objectContaining({ x: 447, y: 76 })],
        })
    })
    it('processes screen and key targets from touch events', () => {
        const fn = jest.fn()
        device.on('touchstart', fn)
        device.onReceive(Buffer.from('094d00000022008f13', 'hex'))
        expect(fn).toHaveBeenCalledWith(expect.objectContaining({
            changedTouches: [expect.objectContaining({ target: { screen: 'left', key: undefined } })],
        }))
        device.onReceive(Buffer.from('094d00000067004816', 'hex'))
        expect(fn).toHaveBeenCalledWith(expect.objectContaining({
            changedTouches: [expect.objectContaining({ target: { screen: 'center', key: 0 } })],
        }))
        device.onReceive(Buffer.from('094d000000c8008011', 'hex'))
        expect(fn).toHaveBeenCalledWith(expect.objectContaining({
            changedTouches: [expect.objectContaining({ target: { screen: 'center', key: 5 } })],
        }))
        device.onReceive(Buffer.from('094d0000017500d21a', 'hex'))
        expect(fn).toHaveBeenCalledWith(expect.objectContaining({
            changedTouches: [expect.objectContaining({ target: { screen: 'center', key: 11 } })],
        }))
        device.onReceive(Buffer.from('094d000001c200b8ff', 'hex'))
        expect(fn).toHaveBeenCalledWith(expect.objectContaining({
            changedTouches: [expect.objectContaining({ target: { screen: 'right', key: undefined } })],
        }))
    })
    it('processes multiple simultaneous touches', () => {
        const touchstart = jest.fn()
        const touchmove = jest.fn()
        const touchend = jest.fn()
        device.on('touchstart', touchstart)
        device.on('touchmove', touchmove)
        device.on('touchend', touchend)

        // Multiple starts
        const TOUCH_1_START = Buffer.from('094d000001bf004c01', 'hex')
        const TOUCH_2_START = Buffer.from('094d00000002000102', 'hex')
        device.onReceive(TOUCH_1_START)
        expect(touchstart).toHaveBeenCalledWith({
            touches: [expect.objectContaining({ id: 1 })],
            changedTouches: [expect.objectContaining({ id: 1 })],
        })
        device.onReceive(TOUCH_2_START)
        expect(touchstart).toHaveBeenCalledWith({
            touches: [expect.objectContaining({ id: 1 }), expect.objectContaining({ id: 2 })],
            changedTouches: [expect.objectContaining({ id: 2 })],
        })

        // Independent moves
        const TOUCH_1_MOVE = Buffer.from('094d000001bf004f01', 'hex')
        const TOUCH_2_MOVE = Buffer.from('094d00000004000802', 'hex')
        device.onReceive(TOUCH_2_MOVE)
        expect(touchmove).toHaveBeenCalledWith({
            touches: [expect.objectContaining({ id: 1 }), expect.objectContaining({ id: 2 })],
            changedTouches: [expect.objectContaining({ id: 2 })],
        })
        device.onReceive(TOUCH_1_MOVE)
        expect(touchmove).toHaveBeenCalledWith({
            touches: [expect.objectContaining({ id: 1 }), expect.objectContaining({ id: 2 })],
            changedTouches: [expect.objectContaining({ id: 1 })],
        })

        // Remove one touch
        const TOUCH_1_REMOVE = Buffer.from('096d000001bf004f01', 'hex')
        device.onReceive(TOUCH_1_REMOVE)
        expect(touchend).toHaveBeenCalledWith({
            touches: [expect.objectContaining({ id: 2 })],
            changedTouches: [expect.objectContaining({ id: 1 })],
        })
    })
    it('ignores unknown messages', () => {
        const SAMPLE_MESSAGE = Buffer.from('ffffffffffffff', 'hex')
        expect(() => device.onReceive(SAMPLE_MESSAGE)).not.toThrow()
    })
})

