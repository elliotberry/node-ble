jest.mock('../src/BusHelper');
jest.mock('../src/GattServer')

const dbus = Symbol()

const Device = require('../src/Device')
const GattServer = require('../src/GattServer')

test("props", async () => {
  const device = new Device(dbus, 'hci0', 'dev_00_00_00_00_00_00')
  device.helper.prop.mockImplementation((value) => Promise.resolve(({
    Name: '_name_',
    Address: '00:00:00:00:00:00',
    AddressType: 'public',
    Alias: '_alias_',
    RSSI: 100,
    TxPower: 50,

    Paired: true,
    Connected: true,
  }[value])))

  await expect(device.getName()).resolves.toEqual('_name_')
  await expect(device.getAddress()).resolves.toEqual('00:00:00:00:00:00')
  await expect(device.getAddressType()).resolves.toEqual('public')
  await expect(device.getAlias()).resolves.toEqual('_alias_')
  await expect(device.getRSSI()).resolves.toEqual(100)
  await expect(device.getTXPower()).resolves.toEqual(50)

  await expect(device.isConnected()).resolves.toEqual(true)
  await expect(device.isPaired()).resolves.toEqual(true)

  await expect(device.toString()).resolves.toEqual('_name_ [00:00:00:00:00:00]')
})

test("pairing", async () => {
  const device = new Device(dbus, 'hci0', 'dev_00_00_00_00_00_00')

  await expect(device.pair()).resolves.toBeUndefined()
  expect(device.helper.callMethod).toHaveBeenLastCalledWith('Pair')

  await expect(device.cancelPair()).resolves.toBeUndefined()
  expect(device.helper.callMethod).toHaveBeenLastCalledWith('CancelPair')

  expect(device.helper.callMethod).toHaveBeenCalledTimes(2)
})

test("connection", async () => {
  const device = new Device(dbus, 'hci0', 'dev_00_00_00_00_00_00')

  await expect(device.connect()).resolves.toBeUndefined()
  expect(device.helper.callMethod).toHaveBeenLastCalledWith('Connect')

  await expect(device.disconnect()).resolves.toBeUndefined()
  expect(device.helper.callMethod).toHaveBeenLastCalledWith('Disconnect')

  expect(device.helper.callMethod).toHaveBeenCalledTimes(2)
})

test("gatt server initialization", async () => {
  const device = new Device(dbus, 'hci0', 'dev_00_00_00_00_00_00')

  const gattServer = await device.gatt()

  expect(GattServer).toHaveBeenCalledWith(dbus, 'hci0', 'dev_00_00_00_00_00_00')
  expect(gattServer.init).toHaveBeenCalledTimes(1)
})
