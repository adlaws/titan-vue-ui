class CryptoUtils
{
    static simpleUUID(prefix = '')
    {
        return prefix +
               (CryptoUtils.SIMPLE_UUID_COUNT++) +
               's' +
               Date.now().toString(36) +
               Array.from(CryptoUtils.randomIntValues(3)).map((x) => x.toString(36)).join('');
    }

    /**
     * Utility function to generate a Version 4 UUID
     *
     * A Version 4 UUID is a universally unique identifier that is generated using random numbers.
     *
     * @return a Version 4 UUID (such as "9697a023-810c-4034-a552-aad10053b161")
     */
    static v4UUID()
    {
        const s = CryptoUtils.randomIntValuesInRange(0x10000, 0x1FFFF, 8).map((x) => x.toString(16).substring(1));
        return `${s[0]}${s[1]}-${s[2]}-${s[3]}-${s[4]}-${s[5]}${s[6]}${s[7]}`;
    }

    /**
     * Generate a cryptographically secure sequence of random integer values that fall
     * within a given range
     *
     * NOTE: will fall back to Math.random() in the case that native crypto is not
     *       available in the browser
     *
     * @param {Number} min the minimum possible value (inclusive)
     * @param {Number} max the maximum possible value (inclusive)
     * @param {Number} count the number of random values to create
     */
    static randomIntValuesInRange(min, max, count = 1)
    {
        const range = (max - min) + 1;
        return CryptoUtils.randomIntValues(count).map((x) => (Math.abs(x) % range) + min);
    }

    /**
     * Generate a cryptographically secure sequence of random 32 bit integer values
     *
     * NOTE: will fall back to Math.random() in the case that native crypto is not
     *       available in the browser
     *
     * @param {Number} count the number of random values to create
     */
    static randomIntValues(count = 1)
    {
        // sanity checks
        count = Math.max(1, count || 1);
        // check for built in crypto functionality
        const crypto = window.crypto || window.msCrypto;
        if(crypto && crypto.getRandomValues)
        {
            // use built in crypto
            const randomWords = new Int32Array(count);
            crypto.getRandomValues(randomWords);
            return Array.from(randomWords);
        }

        // fall back to Math.random()
        // TODO is it worth bringing in something like the Stanford Javascript Crypto
        //      Library (http://bitwiseshiftleft.github.com/sjcl/) as a fallback?
        const randomWords = [];
        for(let i = 0; i < count; i++)
            randomWords.push(Math.random() * Number.MAX_SAFE_INTEGER);
        return randomWords;
    }

    /**
     *
     * @param {Number} length the length of the required text
     * @param {String} characterPool (optional) a String containing the characters from which the
     *        random text is to be constructed. If unspecified the ALPHANUMERICSPECIAL pool (i.e.,
     *        all upper and lower case characters, numbers and special symbols) is used.
     */
    static randomString(length, characterPool = CryptoUtils.ALPHANUMERICSPECIAL)
    {
        length = length || 0;
        if(length === 0)
            return '';
        characterPool = characterPool || CryptoUtils.ALPHANUMERICSPECIAL;

        const charIndexes = CryptoUtils.randomIntValuesInRange(0, characterPool.length, length);
        return charIndexes.map((i) => characterPool.charAt(i)).join('');
    }

    /**
     * Generate a random password
     *
     * @param {*} opts password generation options:
     *            length {Number} the length of the password (default: 8)
     *            charPool {String} the pool of characters from which the password may be constructed
     *            avoidSpecial {boolean} NOTE: Ignored if `charPool` is set. If true avoid
     *                         non-alphanumeric characters (default: false)
     *            avoidAmbiguous {boolean} NOTE: Ignored if `charPool` is set. If true avoid
     *                           visually ambiguous characters such as ` and ',
     *                           o, 0 and O, etc (default: false)
     *            makePronounceable {boolean} NOTE: Ignored if `charPool` is set. If true create a
     *                           password which is "pronounceable" (default: false)
     */
    static generatePassword(opts = {})
    {
        const defaultOpts = {
            length: 8,
            charPool: null,
            avoidSpecial: false,
            avoidAmbiguous: false,
            makePronounceable: false
        };
        opts = { ...defaultOpts, ...opts };

        // sanity checks
        const length = Math.max(1, opts.length || 8);
        const charPool = opts.charPool || null;
        const avoidSpecial = opts.avoidSpecial || false;
        const avoidAmbiguous = opts.avoidAmbiguous || false;
        const makePronounceable = opts.makePronounceable || false;

        const randomValues = CryptoUtils.randomIntValues(length).map((x) => Math.abs(x));
        let password = '';

        if(charPool)
        {
            // use specified pool of characters to create password
            for(let i = 0; i < randomValues.length; i++)
                password += charPool.charAt(randomValues[i] % charPool.length);
        }
        else if(makePronounceable)
        {
            // alternate vowels and consonants to make a "pronouncable word"
            let vowels = CryptoUtils.L33T_VOWELS;
            let consonants = CryptoUtils.L33T_CONSONANTS;
            if(avoidSpecial)
            {
                // strip special characters
                vowels = CryptoUtils._removeChars(vowels, CryptoUtils.SPECIAL);
                consonants = CryptoUtils._removeChars(consonants, CryptoUtils.SPECIAL);
            }
            if(avoidAmbiguous)
            {
                // strip visually ambiguous characters
                vowels = CryptoUtils._removeChars(vowels, CryptoUtils.AMBIGUOUS);
                consonants = CryptoUtils._removeChars(consonants, CryptoUtils.AMBIGUOUS);
            }
            for(let i = 0; i < randomValues.length; i++)
            {
                const index = randomValues[i];
                if(i % 2 === 0)
                    password += consonants.charAt(index % consonants.length);
                else
                    password += vowels.charAt(index % vowels.length);
            }
        }
        else
        {
            // start with letters and numbers
            let pool = CryptoUtils.ALPHANUMERIC;
            if(!avoidSpecial)
            {
                // add special characters if appropriate
                pool += CryptoUtils.SPECIAL;
            }
            if(avoidAmbiguous)
            {
                // strip visually ambiguous characters
                pool = CryptoUtils._removeChars(pool, CryptoUtils.AMBIGUOUS);
            }
            for(let i = 0; i < randomValues.length; i++)
                password += pool.charAt(randomValues[i] % pool.length);
        }
        return password;
    }

    static _removeChars(original, charsToRemove)
    {
        let result = '';
        for(let idx = 0; idx < original.length; idx++)
        {
            const c = original.charAt(idx);
            if(charsToRemove.indexOf(c) < 0)
                result += c;
        }
        return result;
    }
}

CryptoUtils.SIMPLE_UUID_COUNT = 0;

CryptoUtils.NUMERIC = '0123456789';
CryptoUtils.LOWER_CASE = 'abcdefghijklmnopqrstuvwxyz';
CryptoUtils.UPPER_CASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
CryptoUtils.ALPHA = CryptoUtils.LOWER_CASE + CryptoUtils.UPPER_CASE;
CryptoUtils.ALPHANUMERIC = CryptoUtils.ALPHA + CryptoUtils.NUMERIC;
CryptoUtils.SPECIAL = '`~!@#$%^&*()+=[]{}\\|;\':",.<>/?';
CryptoUtils.ALPHANUMERICSPECIAL = CryptoUtils.ALPHANUMERIC + CryptoUtils.SPECIAL;
CryptoUtils.VOWELS = 'aeiou';
// vowels and their equivalent 'l33t' characters
CryptoUtils.L33T_VOWELS = '@aA4eE3iI1!oO0u';
// consonants and their equivalent 'l33t' characters
CryptoUtils.L33T_CONSONANTS = 'bB8cC([{dDfFgG6hH#jJkKlL1!mMnNpPqQrRsS5$tT7vVwWxX*yYzZ2?';
// characters which are visually ambiguous (for example, O and 0 may be mistaken for each other)
CryptoUtils.AMBIGUOUS = '0OQo1lI|2Z5S7Tx*C()[]{}<>:;,./\\\'`"';

export default CryptoUtils;
