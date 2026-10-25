# Generator source

The page, decision and workflow models are the single source for docs 03, 04, 05, 16, 19, 20 and the board (21).

```
node gen.cjs <package dir> board_data.js        # 03, 04, 05, 16, 19, 20
node build_board.cjs <package dir>              # 21/index.html (reads 11 and 20)
python3 validate.py                             # validation checklist (paths are absolute to this checkout)
```

`decisions.cjs` keeps `founderSelection: null` for every decision. Recording a decision is done on the board or by editing doc 20 and committing it, not by editing this model.
