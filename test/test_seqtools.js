/*
 * msa-seqtools
 * https://github.com/greenify/msa-seqtools
 *
 * Copyright (c) 2014 greenify
 * Licensed under the MIT license.
 */

// chai is an assertion library
const chai = require('chai');

// @see http://chaijs.com/api/assert/
const assert = chai.assert;
const equal = assert.deepEqual;

// requires your main app (specified in index.js)
const st = require('../lib/index');

describe('msa-seqtools module', () => {
  describe('#getMeta()', () => {
    it('should split correctly', () => {
      equal(st.getMeta('sp|abc|def'), {
        name: 'def',
        ids: {
          sp: 'abc'
        },
        details: {
          en: 'def'
        }
      });
    });
    it('should should recognize key=value', () => {
      equal(st.getMeta('sp|abc|def a long description OS=organism GN=genename'), {
        name: 'def',
        ids: {
          sp: 'abc'
        },
        details: {
          os: 'organism',
          gn: 'genename',
          en: 'def'
        },
        desc: 'a long description'
      });
    });
    it('should deal with spaces in key=value', () => {
      equal(st.getMeta('sp|abc|def Carotenoid cleavage dioxygenase 8, chloroplastic OS=Arabidopsis thaliana GN=CCD8 PE=1 SV=1 '), {
        name: 'def',
        desc: 'Carotenoid cleavage dioxygenase 8, chloroplastic',
        ids: {
          sp: 'abc'
        },
        details: {
          os: 'Arabidopsis thaliana',
          gn: 'CCD8',
          pe: '1',
          sv: '1',
          en: 'def'
        }
      });
    });
    it('correctly parse descriptions without key=value', () => {
      equal(st.getMeta('sp|abc|def a long description with no key values'), {
        name: 'def',
        ids: {
          sp: 'abc'
        },
        details: {
          en: 'def'
        },
        desc: 'a long description with no key values'
      });
    });

  });
  describe('#buildLinks()', () => {
    it('should show correct links', () => {
      equal(st.buildLinks(st.getMeta('sp|abc|def').ids), {
        'Uniprot': 'http://www.uniprot.org/abc'
      })
    });
  });
  describe('#contains()', () => {
    it('should find text', () => {
      assert.ok(st.contains('abc', 'a'));
    });
    it('should not find non-existing text', () => {
      assert.notOk(st.contains('abc', 'e'));
    });
  });
  describe('#splitNChars()', () => {
    it('should split correctly', () => {
      equal(st.splitNChars('abc', 2), ['ab', 'c']);
    });
  });
  describe('#complement()', () => {
    it('should complement sequence correctly', () => {
      equal(st.complement('actgACTG'), 'tgacTGAC');
    });
  });
  describe('#reverse()', () => {
    it('should reverse a sequence', () => {
      equal(st.reverse('actgACTG'), 'GTCAgtca');
    });
  });
  describe('#reverseComplement()', () => {
    it('should reverse a sequence', () => {
      equal(st.reverseComplement('actgACTG'), 'CAGTcagt');
    });
  });
});
