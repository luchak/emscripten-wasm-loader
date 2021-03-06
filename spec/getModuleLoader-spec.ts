import { expect } from 'chai';
import { ENVIRONMENT } from '../src/environment';
import { getModuleLoader } from '../src/getModuleLoader';

jest.mock('../src/util/isNode');
jest.mock('../src/constructModule');

//tslint:disable-next-line:no-require-imports no-var-requires
const mockIsNode = require('../src/util/isNode').isNode as jest.Mock<any>;

describe('getModuleLoader', () => {
  it('should create loader function with node environment', async () => {
    mockIsNode.mockReturnValueOnce(true);

    const factoryLoader = jest.fn(() => 'boo');
    const mockRuntime = { initializeRuntime: () => Promise.resolve(true) };
    const runtimeModule = jest.fn(() => mockRuntime);

    const loader = getModuleLoader(factoryLoader as any, runtimeModule);

    const loaded = await loader();

    expect(runtimeModule.mock.calls).to.have.lengthOf(1);
    expect(factoryLoader.mock.calls).to.have.lengthOf(1);
    expect(factoryLoader.mock.calls[0][0]).to.deep.equal(mockRuntime);
    expect(factoryLoader.mock.calls[0][1]).to.equal(ENVIRONMENT.NODE);

    expect(loaded).to.equal('boo');
  });

  it('should create loader function with browser environment', async () => {
    mockIsNode.mockReturnValueOnce(false);

    const factoryLoader = jest.fn(() => 'boo');
    const mockRuntime = { initializeRuntime: () => Promise.resolve(true) };
    const runtimeModule = jest.fn(() => mockRuntime);

    const loader = getModuleLoader(factoryLoader as any, runtimeModule);

    const loaded = await loader();

    expect(runtimeModule.mock.calls).to.have.lengthOf(1);
    expect(factoryLoader.mock.calls).to.have.lengthOf(1);
    expect(factoryLoader.mock.calls[0][0]).to.deep.equal(mockRuntime);
    expect(factoryLoader.mock.calls[0][1]).to.equal(ENVIRONMENT.WEB);

    expect(loaded).to.equal('boo');
  });

  it('should allow override environment to browser via loader', async () => {
    mockIsNode.mockReturnValueOnce(true);
    const factoryLoader = jest.fn(() => 'boo');
    const mockRuntime = { initializeRuntime: () => Promise.resolve(true) };
    const runtimeModule = jest.fn(() => mockRuntime);

    const loader = getModuleLoader(factoryLoader as any, runtimeModule);

    await loader(ENVIRONMENT.WEB);
    expect(factoryLoader.mock.calls[0][1]).to.equal(ENVIRONMENT.WEB);
  });

  it('should allow override environment to node via loader', async () => {
    mockIsNode.mockReturnValueOnce(false);
    const factoryLoader = jest.fn(() => 'boo');
    const mockRuntime = { initializeRuntime: () => Promise.resolve(true) };
    const runtimeModule = jest.fn(() => mockRuntime);

    const loader = getModuleLoader(factoryLoader as any, runtimeModule);

    await loader(ENVIRONMENT.NODE);
    expect(factoryLoader.mock.calls[0][1]).to.equal(ENVIRONMENT.NODE);
  });

  it('should throw when init runtime fail', async () => {
    mockIsNode.mockReturnValueOnce(true);

    const runtimeModule = jest.fn(() => ({ initializeRuntime: () => Promise.reject(new Error('meh')) }));

    const loader = getModuleLoader(null as any, runtimeModule);
    let thrown = false;
    try {
      await loader();
    } catch (e) {
      expect(e).to.be.a('Error');
      thrown = true;
    }
    expect(thrown).to.be.true;
  });
});
