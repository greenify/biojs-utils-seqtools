/*
 * msa-seqtools
 * https://github.com/greenify/msa-seqtools
 *
 * Copyright (c) 2014 greenify
 * Licensed under the MIT license.
 */



/**
 * Seems to be lots of different ways to format FASTA headers. 
 * 
 * Generally there's an ID and a DESCRIPTION
 *   >ID DESCRIPTION
 * 
 *   >(parts|of|ID) (DESCRIPTION with optional key=values)
 *   
 * This is complicated by the fact that the "values" in the description can have spaces
 * e.g. OS=Arabidopsis thaliana GN=CCD8
 * 
 **/
class SeqTools {
  /**
   * extract IDs and push them to the meta dict
   * @param {string} label
   */
  getMeta(label) {
    let fullId = null,
      fullDesc = null;

    let labelParts = label.split(' ');

    if (labelParts.length > 0) {
      fullId = labelParts.shift();      // everything up to the first white space
      fullDesc = labelParts.join(' ');  // everything else
    } else {
      fullId = label;
    }

    let details = {},
      ids = {},
      name = '',
      description;

    if (fullId) {
      let idParts = fullId.split('|');
      // keep details.en for backward compartibility
      details.accession = details.en = name = idParts.pop(); // the last item is the accession

      // everything else should be pairs: db|id
      while (idParts.length !== 0) {
        let db = idParts.shift();
        let id = idParts.shift();
        ids[db] = id;
      }
    } else {
      name = fullId;
    }

    if (fullDesc) {
      let descParts = fullDesc.split('=');

      if (descParts.length > 1) {

        descParts.forEach(element => {
          element = element.trim();

          let descElemValueParts = element.split(' ');
          let nextKey,
            value;

          if (descElemValueParts.length > 1) {
            nextKey = descElemValueParts.pop();
            value = descElemValueParts.join(' ');
          } else {
            value = element;
          }

          let currentKey;
          if (currentKey) {
            let key = currentKey.toLowerCase();
            details[key] = value;
          } else {
            description = value;
          }
          currentKey = nextKey;
        });
      } else {
        description = descParts.shift();
      }
    }

    let meta = {
      name: name,
      ids: ids,
      details: details
    };

    if (description) meta.desc = description;

    return meta;
  }


  buildLinks(meta = {}) {
    let links = [];

    Object.keys(meta).forEach(id => {
      if (id in identDB) {
        let entry = identDB[id];
        let link = entry.link.replace('%s', meta[id]);
        links[entry.name] = link;
      }
    });
    return links;
  }

  /**
   * search for a text
   * kept for backward compartibility
   * @param {string} text Search text
   * @param {string} str Subject to search for
   * @deprecated Please use string.prototype.includes() instead
   */
  contains(text, str) {
    return text.includes(str);
  }

  /**
   * split after e.g. 80 chars
   * @param {string} txt
   * @param {number} num
   */
  splitNChars(txt, num = 80) {
    let result = [];

    for (let i = 0, ref = txt.length - 1; i <= ref; i += num) {
      result.push(txt.substr(i, num));
    }

    return result;
  }

  /**
   * Reverse a sequence
   * @param {string} seq
   */
  reverse(seq) {
    return seq.split('').reverse().join('');
  }

  /**
   * Returns the complement to the input sequence
   * @param {string} seq
   */
  complement(seq) {
    let newSeq = seq + "";

    for (const rep in baseReplacements) {
      newSeq = newSeq.replace(baseReplacements[rep][0], baseReplacements[rep][1]);
    }
    return newSeq;
  }
}


let identDB = {
  "sp": {
    link: "http://www.uniprot.org/%s",
    name: "Uniprot"
  },
  "tr": {
    link: "http://www.uniprot.org/%s",
    name: "Trembl"
  },
  "gb": {
    link: "http://www.ncbi.nlm.nih.gov/nuccore/%s",
    name: "Genbank"
  },
  "pdb": {
    link: "http://www.rcsb.org/pdb/explore/explore.do?structureId=%s",
    name: "PDB"
  }
};

let baseReplacements = [
  // cg
  [/g/g, "0"],
  [/c/g, "1"],
  [/0/g, "c"],
  [/1/g, "g"],
  // CG
  [/G/g, "0"],
  [/C/g, "1"],
  [/0/g, "C"],
  [/1/g, "G"],
  // at
  [/a/g, "0"],
  [/t/g, "1"],
  [/0/g, "t"],
  [/1/g, "a"],
  // AT
  [/A/g, "0"],
  [/T/g, "1"],
  [/0/g, "T"],
  [/1/g, "A"],
];

module.exports = SeqTools;