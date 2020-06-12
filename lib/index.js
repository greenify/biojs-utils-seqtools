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
    let fullId = '', fullDesc = '';
    let name, ids = {}, details = {}, description;

    // 	console.log( "getMeta.label: ", label );

    let labelParts = label.split(" ");

    if (labelParts.length >= 1) {
      fullId = labelParts.shift();     // everything up to the first white space
      fullDesc = labelParts.join(" "); // everything else
    }
    else {
      fullId = label;
    }

    // 	console.log( "fullId", fullId );
    // 	console.log( "fullDesc", fullDesc );

    if (fullId) {
      let idParts = fullId.split('|');

      // the last item is the accession
      name = idParts.pop();

      details.en = name;

      // everything else should be pairs: db|id
      while (idParts.length != 0) {
        let db = idParts.shift();
        let id = idParts.shift();
        ids[db] = id;
      }
    }
    else {
      name = fullId;
    }

    if (fullDesc) {

      let kvParts = fullDesc.split('=');

      if (kvParts.length > 1) {

        let currentKey, nextKey;
        kvParts.forEach(function (valueAndMaybeNextKey) {

          valueAndMaybeNextKey = valueAndMaybeNextKey.trim();

          let valueParts = valueAndMaybeNextKey.split(" ");
          let value;
          if (valueParts.length > 1) {
            nextKey = valueParts.pop();
            value = valueParts.join(' ');
          }
          else {
            value = valueAndMaybeNextKey;
          }

          if (currentKey) {
            let key = currentKey.toLowerCase();
            details[key] = value;
            //console.log( "details[" + key + "] = " + value );
          }
          else {
            description = value;
            //console.log( "description=" + value );
          }
          currentKey = nextKey;
        });
      }
      else {
        description = kvParts.shift();
      }
    }

    let meta = {
      name: name,
      ids: ids,
      details: details,
    };

    if (description) {
      meta.desc = description;
    }

    // 	console.log( "meta", meta );

    return meta;
  }

  /**
   * build links from ids
   * @param {any} meta
   */
  buildLinks(meta) {
    let links = {};
    meta = meta || {};
    Object.keys(meta).forEach(function (id) {
      if (id in identDB) {
        let entry = identDB[id];
        let link = entry.link.replace("%s", meta[id]);
        links[entry.name] = link;
      }
    });
    return links;
  }

  /**
   * search for a text
   * @param {string} text
   * @param {string} search 
   */
  contains(text, search) {
    return ''.indexOf.call(text, search, 0) !== -1;
  }

  /**
   * split after e.g. 80 chars
   * @param {string} txt
   * @param {number} num
   */
  splitNChars(txt, num) {
    num = num || 80;
    let result = [];
    for (let i = 0, _ref = txt.length - 1; i <= _ref; i += num) {
      result.push(txt.substr(i, num));
    }
    return result;
  }

  /**
   * reverse a sequence
   * @param {string} seq
   */
  reverse(seq) {
    return seq.split('').reverse().join('');
  }

  /**
   * return according complement sequence
   * @param {string} seq
   */
  complement(seq) {
    let newSeq = seq + "";
    let replacements = [
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

    for (let rep in replacements) {
      newSeq = newSeq.replace(replacements[rep][0], replacements[rep][1]);
    }
    return newSeq;
  };

  /**
   * reverse and complement a sequence
   * @param {string} seq
   */
  reverseComplement(seq) {
    return this.reverse(this.complement(seq));
  }

  model = function Seq(seq, name, id) {
    this.seq = seq;
    this.name = name;
    this.id = id;
    this.ids = {};
  };
}

function findSepInArr(arr, sep) {
  for (let i = 0; i < arr.lenght; i++) {
    if (arr[i].indexOf(i)) {
      return i;
    }
  }
  return arr.length - 1;
}

function strToDict(str, sep, toJoin) {
  toJoin = toJoin || {};
  let entries = str.split(sep);
  toJoin[entries[0].toLowerCase()] = entries[1];
  return toJoin;
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

module.exports = new SeqTools();