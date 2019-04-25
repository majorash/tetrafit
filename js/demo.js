/******************************************************************************

 This is a demo page to experiment with binary tree based
 algorithms for packing blocks into a single 2 dimensional bin.

 See individual .js files for descriptions of each algorithm:

  * packer.js         - simple algorithm for a fixed width/height bin
  * packer.growing.js - complex algorithm that grows automatically

 TODO
 ====
  * step by step animated render to watch packing in action (and help debug)
  * optimization - mark branches as "full" to avoid walking them
  * optimization - dont bother with nodes that are less than some threshold w/h (2? 5?)

*******************************************************************************/

  
Demo = {

  init: function () {

    Demo.el = {
      examples: $('.example'),
      blocks: $('.block_color'),
      canvas: $('#canvas')[0],
      size: $('.size_block'),
      sort: $('.sorting'),
      color: $('.color_desc'),
      ratio: $('.ratios'),
      nofit: $('.nofitting')
    };



    if (!Demo.el.canvas.getContext) // no support for canvas
      return false;

    Demo.el.draw = Demo.el.canvas.getContext("2d");

    Demo.el.blocks.val(Demo.blocks.serialize(Demo.blocks.examples.current()));
    Demo.el.blocks.change(Demo.run);
    Demo.el.size.change(Demo.run);
    Demo.el.sort.change(Demo.run);
    Demo.el.color.change(Demo.run);
    Demo.el.examples.change(Demo.blocks.examples.change);
    Demo.run();
    Demo.el.blocks.keypress(function (ev) {
      if (ev.which == 13)
        Demo.run(); // run on <enter> while entering block information
    });
  },

  //---------------------------------------------------------------------------

  run: function () {

    var blocks = Demo.blocks.deserialize(Demo.el.blocks.val());
    var packer = Demo.packer();

    Demo.sort.now(blocks);

    packer.fit(blocks);

    Demo.canvas.reset(packer.root.w, packer.root.h);
    Demo.canvas.blocks(blocks);
    Demo.canvas.boundary(packer.root);
    Demo.report(blocks, packer.root.w, packer.root.h);
  },

  //---------------------------------------------------------------------------
  packer: function () {
    var size = Demo.el.size.val();
    if (size == 'automatic') {
      return new GrowingPacker();
    } else {
      var dims = size.split("x");
      return new Packer(parseInt(dims[0]), parseInt(dims[1]));
    }
  },

  //---------------------------------------------------------------------------

  report: function (blocks, w, h) {
    var fit = 0,
      nofit = [],
      block, n, len = blocks.length;
    for (n = 0; n < len; n++) {
      block = blocks[n];
      if (block.fit)
        fit = fit + block.area;
      else
        nofit.push("" + block.w + "x" + block.h);
    }
    Demo.el.ratio.text(Math.round(100 * fit / (w * h)));
    Demo.el.nofit.html("Ce qui ne rentre pas dans le camion :  (" + nofit.length + ") :<br>" + nofit.join(", ")).toggle(nofit.length > 0);
  },
  //---------------------------------------------------------------------------

  sort: {

    random: function (a, b) {
      return Math.random() - 0.5;
    },
    w: function (a, b) {
      return b.w - a.w;
    },
    h: function (a, b) {
      return b.h - a.h;
    },
    a: function (a, b) {
      return b.area - a.area;
    },
    max: function (a, b) {
      return Math.max(b.w, b.h) - Math.max(a.w, a.h);
    },
    min: function (a, b) {
      return Math.min(b.w, b.h) - Math.min(a.w, a.h);
    },
    type: function (a, b) {
      return a.type - b.type;
    },

    height: function (a, b) {
      return Demo.sort.msort(a, b, ['h', 'w']);
    },
    width: function (a, b) {
      return Demo.sort.msort(a, b, ['w', 'h']);
    },
    area: function (a, b) {
      return Demo.sort.msort(a, b, ['type', 'a', 'h', 'w']);
    },
    maxside: function (a, b) {
      return Demo.sort.msort(a, b, ['type', 'max', 'min', 'h', 'w']);
    },
    type_: function (a, b) {
      return Demo.sort.msort(a, b, ['type']);
    },


    msort: function (a, b, criteria) {
      /* sort by multiple criteria */
      var diff, n;
      for (n = 0; n < criteria.length; n++) {
        diff = Demo.sort[criteria[n]](a, b);
        if (diff != 0)
          return diff;
      }
      return 0;
    },

    now: function (blocks) {
      var sort = Demo.el.sort.val();
      if (sort != 'none')
        blocks.sort(Demo.sort[sort]);

    }
  },

  //---------------------------------------------------------------------------

  canvas: {

    reset: function (width, height) {
      Demo.el.canvas.width = width + 1; // add 1 because we draw boundaries offset by 0.5 in order to pixel align and get crisp boundaries
      Demo.el.canvas.height = height + 1; // (ditto)
      Demo.el.draw.clearRect(0, 0, Demo.el.canvas.width, Demo.el.canvas.height);
    },

    rect: function (x, y, w, h, color) {
      Demo.el.draw.fillStyle = color;
      Demo.el.draw.fillRect(x + 0.5, y + 0.5, w, h);
    },

    stroke: function (x, y, w, h) {
      Demo.el.draw.strokeRect(x + 0.5, y + 0.5, w, h);
    },

    blocks: function (blocks) {
      var n, block;
      for (n = 0; n < blocks.length; n++) {
        block = blocks[n];
        if (block.fit)
          Demo.canvas.rect(block.fit.x, block.fit.y, block.w, block.h, Demo.color(block.type));
      }
    },

    boundary: function (node) {
      if (node) {
        Demo.canvas.stroke(node.x, node.y, node.w, node.h);
        Demo.canvas.boundary(node.down);
        Demo.canvas.boundary(node.right);
      }
    }
  },

  //---------------------------------------------------------------------------

  blocks: {

    examples: {

      complex: [{
          w: 100,
          h: 100,
          num: 3,
          type: 0
        },
        {
          w: 60,
          h: 60,
          num: 3,
          type: 0
        },
        {
          w: 100,
          h: 40,
          num: 0,
          type: 2
        },
        {
          w: 20,
          h: 50,
          num: 20,
          type: 1
        },
        {
          w: 250,
          h: 250,
          num: 1,
          type: 1
        },
        {
          w: 250,
          h: 100,
          num: 1,
          type: 0
        },
        {
          w: 100,
          h: 250,
          num: 1,
          type: 0
        },
        {
          w: 200,
          h: 80,
          num: 1,
          type: 2
        },
        {
          w: 80,
          h: 400,
          num: 1,
          type: 0
        },
        {
          w: 60,
          h: 60,
          num: 10,
          type: 1
        },
      ],

      current: function () {
        return Demo.blocks.examples[Demo.el.examples.val()];
      },

      change: function () {
        Demo.el.blocks.val(Demo.blocks.serialize(Demo.blocks.examples.current()));
        Demo.run();
      }
    },

    deserialize: function (val) {
      var i, j, block, blocks = val.split("\n"),
        result = [];
      for (i = 0; i < blocks.length; i++) {
        block = blocks[i].split(/[^0-9.]/g);
        if (block.length >= 3)
          result.push({
            w: parseInt(block[0]),
            h: parseInt(block[1]),
            num: (block.length == 3 ? 1 : parseInt(block[2])),
            type: parseInt(block[3])
          });
      }
      var expanded = [];
      for (i = 0; i < result.length; i++) {
        for (j = 0; j < result[i].num; j++)
          expanded.push({
            w: result[i].w,
            h: result[i].h,
            type: result[i].type,
            area: result[i].w * result[i].h
          });
      }
      return expanded;
    },

    serialize: function (blocks) {
      var i, block, str = "";
      for (i = 0; i < blocks.length; i++) {
        block = blocks[i];
        str = str + block.w + "x" + block.h + (block.num > 1 ? "x" + block.num : "x" + 1) + "x" + block.type + "\n";
      }
      return str;
    }

  },

  //---------------------------------------------------------------------------

  colors: {
    couleur: ["#E5E059", "#5AE681", "#925AE6"],
  },

  color: function (n) {
    var cols = Demo.colors['couleur'];
    return cols[n % cols.length];
  },

  //---------------------------------------------------------------------------

}

function creatInput(id) {
  var largeur = document.createElement("input");
  largeur.id = id;
  largeur.className ="largeur";
  var labelLargeur = document.createElement("label")
  labelLargeur.htmlFor = id;
  labelLargeur.textContent = "Largeur : "
  labelLargeur.appendChild(largeur)

  var longueur = document.createElement("input");
  longueur.id = id;
  longueur.className ="longueur";
  var labelLongueur = document.createElement("label")
  labelLongueur.htmlFor = id;
  labelLongueur.textContent = "longueur : "
  labelLongueur.appendChild(longueur)

  var nombre = document.createElement("input");
  nombre.id = id;
  nombre.className ="nombre";
  var labelNombre = document.createElement("label")
  labelNombre.htmlFor = id;
  labelNombre.textContent = "Nombre : "
  labelNombre.appendChild(nombre)
  $(".input-desc").append(labelLargeur)
  $(".input-desc").append(labelLongueur)
  $(".input-desc").append(labelNombre)
}

function input(id) {
  if (id == 0) {
    creatInput(id)
  } else if (id == 1) {
    creatInput(id)
  } else if (id == 2) {
    creatInput(id)
  }
}
$("#category option").on("click", function () {
  $(".input-desc").html("")
  console.log()
  var id = $(this).val();
  input(id);
})

$(".input-desc").on('keypress', function (e) {
  if (e.which == 13) {
    var val = $(".input-desc .largeur").val()+"x"+$(".input-desc .longueur").val()+"x"+$(".input-desc .nombre").val();
    val += "x" + $(".input-desc input").attr("id") + "\n";
    var acienneVal = $(".block_color").val();
    $(".block_color").val(acienneVal + val)
    Demo.run();
  }
});

$(Demo.init);