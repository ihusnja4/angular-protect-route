import {ProtectionStrategy} from './protection-strategy';

class PseudoComponent {}

describe('ProtectionStrategy', () => {
    describe('resolve()', () => {
        it('returns failed observable', async () => {
            const protectionStrategy = new ProtectionStrategy();
            const config = { component: PseudoComponent };
            try {
                const result = await protectionStrategy.resolve(config).toPromise();
                fail('it should have failed');
            } catch (e) {
                expect(e).withContext('Error message').toBe('Strategy not defined');
            }
        });
    });
});
