import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaintBrush, faCube, faUser, faPlusSquare, faTimes, faTrash,
  faCloudUploadAlt, faSearch, faFolder, faEyeDropper, faEye } from '@fortawesome/free-solid-svg-icons';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { SketchPicker } from 'react-color';
import { Manager, Reference, Popper } from 'react-popper';
import * as THREE from 'three';
import { Viewer } from './viewer';
import logo from './logo.png';
import './grid.css';
import './App.css';

const optionTypes = {
  0: 'Изображение',
  1: 'Цвет'
};

const MAIN_DIR = 'http://localhost/manager/';

async function request(url, params={}) {
  params.credentials = 'include';
  const response = await fetch(MAIN_DIR + url, params);
  return response.json();
}

class Navigation extends React.Component {
  render() {
    return (
      <div className='sidebar'>
        <div className='logo'><img src={logo} alt='Shopcase' /></div>
        <div className='nav'>
          <NavLink text='Предметы' url='/objects/' icon={faCube} />
          <NavLink text='Настройки' url='/options/' icon={faPaintBrush} />
          <NavLink text='Выйти' url='/logout/' icon={faUser} />
        </div>
      </div>
    );
  }
}

class NavLink extends React.Component {
  render() {
    return (
      <Route path={this.props.url} children={({match}) => (
        <div className='nav-el'>
          <Link to={this.props.url} className=
            {'nav-link' + (match ? ' selected' : '')}>
            <span className='nav-icon'>
              <FontAwesomeIcon icon={this.props.icon} />
            </span>
            <span className='nav-link-text'>{this.props.text}</span>
          </Link>
        </div>
      )} />
    );
  }
}

class Modal extends React.Component {
  render() {
    return (
      <div className='modal-background' onClick={() => this.props.setVisible(false)}>
        <div className='modal' onClick={(e) => e.stopPropagation()}>
          <div className='modal-top'>
            <span onClick={() => this.props.setVisible(false)}>
              <FontAwesomeIcon className='modal-close' icon={faTimes} />
            </span>
          </div>
          <div className='modal-content'>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

class AddButton extends React.Component {
  render() {
    return (
      <div className='col add-button-region'>
        <div>
          <button className='button button-primary button-add'
            onClick={this.props.action}>
            <FontAwesomeIcon icon={faPlusSquare} />
            <span className='add-button-text'>Добавить</span>
          </button>
        </div>
      </div>
    );
  }
}

class TableObject extends React.Component {
  render() {
    return (
      <tr className='table-row'>
        <td>{this.props.object.c1}</td>
        <td>{this.props.object.c2}</td>
        <td>{this.props.object.c3}</td>
        <td><button className='button button-delete' onClick={() =>
          this.props.delFunc(this.props.index)}>
          <FontAwesomeIcon icon={faTrash} />
        </button></td>
      </tr>
    );
  }
}

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'modalVisible': false
    }

    this.deleteEl = this.deleteEl.bind(this);
    this.setModalVisible = this.setModalVisible.bind(this);
    this.confirmDel = this.confirmDel.bind(this);

    this.delIndex = 0;
  }

  confirmDel(index) {
    this.setModalVisible(true);
    this.delIndex = index;
  }

  setModalVisible(visible) {
    this.setState({'modalVisible': visible});
  }

  deleteEl() {
    this.setModalVisible(false);
    this.props.onDelete(this.delIndex);
  }

  render() {
    const headers = this.props.headers.map((header, index) =>
      <th key={index}>{header}</th>
    );
    const items = this.props.items.map((item, index) =>
      <TableObject key={item.id} index={index} object={item.getTableObject()}
        delFunc={this.confirmDel} />
    );

    return (
      <div>
        {this.state.modalVisible ? (
          <Modal setVisible={this.setModalVisible}>
            Вы уверены, что<br />хотите удалить этот объект?
            <div className='button-row'>
              <button className='button button-secondary' onClick={
                this.deleteEl}>Да</button>
              <button className='button button-primary' onClick={
                () => this.setModalVisible(false)}>Нет</button>
            </div>
          </Modal>
        ) : null}
        <table className='table'>
          <tbody>
            <tr className='table-header'>
              {headers}
            </tr>
            {items}
          </tbody>
        </table>
      </div>
    );
  }
}

class Header extends React.Component {
  render() {
    let objString = 'объектов';
    const ld = '' + this.props.objCount;
    const lastDigit = parseInt(ld[ld.length - 1], 10);
    if (lastDigit === 1) {
      objString = 'объект';
    } else if (lastDigit > 1 && lastDigit < 5) {
      objString = 'объекта';
    }
    return (
      <div className='row cat-top'>
        <div className='col'>
          <span className='cat-name'>{this.props.catName}</span>
          <span className='obj-count'>{this.props.objCount} {objString}</span>
        </div>
        <AddButton action={() => this.props.setModalVisible(true)} />
      </div>
    );
  }
}

class OptionPreview extends React.Component {
  render() {
    return (
      <div className='option-preview'>
        <span className='option-thumb' style={this.props.option.type === '0' ?
          {'backgroundImage': 'url(' + MAIN_DIR + this.props.option.value + ')'} :
          {'backgroundColor': 'rgba(' + this.props.option.value + ')'}
        } />{this.props.option.name}
      </div>
    );
  }
}

class OptionInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'tooltipVisible': false
    }

    this.setTooltipVisible = this.setTooltipVisible.bind(this);
  }

  setTooltipVisible(visible) {
    this.setState({'tooltipVisible': visible});
  }

  render() {
    return (
      <Manager>
        <Reference>
          {({ref}) => (
            <span className='option-info' ref={ref}
              onMouseEnter={() => this.setTooltipVisible(true)}
              onMouseLeave={() => this.setTooltipVisible(false)}>
              {optionTypes[this.props.option.type]} (
              <span className='option-info-thumb' style={
                this.props.option.type === '0' ?
                  {'backgroundImage': 'url(' + MAIN_DIR + this.props.option.value + ')'} :
                  {'backgroundColor': 'rgba(' + this.props.option.value + ')'}
              }></span>)
            </span>
          )}
        </Reference>
        {this.state.tooltipVisible ? (
          <Popper modifiers={{'preventOverflow': {'enabled': false}}}>
            {({ref, style, placement, arrowProps}) => (
              <div className='info-tooltip' ref={ref} style={style} data-placement={placement}>
                <div className='tooltip-image' style={this.props.option.type === '0' ?
                  {'backgroundImage': 'url(' + MAIN_DIR + this.props.option.value + ')'} :
                  {'backgroundColor': 'rgba(' + this.props.option.value + ')'}}></div>
                <div ref={arrowProps.ref} style={arrowProps.style} />
              </div>
            )}
          </Popper>
        ) : null}
      </Manager>
    );
  }
}

class SObject {
  constructor(ref) {
    this.id = ref.id;
    this.uid = ref.uid;
    this.filename = ref.name;
    this.options = ref.options;
  }

  getTableObject() {
    const tableObject = {
      'c1': this.uid,
      'c2': <Link to={this.id} className='column-name'>{this.filename}</Link>
    };

    const usedOptions = [];
    tableObject['c3'] = this.options.map((option) => {
      if (!usedOptions.includes(option.id)) {
        usedOptions.push(option.id);
        return (
          <div key={option.id} className='column-option'>
            <OptionPreview option={new Option(option)} />
          </div>
        );
      }
    });
    return tableObject;
  }
}

class Option {
  constructor(ref) {
    this.id = ref.id;
    this.name = ref.name;
    this.type = ref.type;
    this.value = ref.value;
    this.obj3d = ref.object3d;
  }

  getTableObject() {
    return {
      'c0': this.id,
      'c1': (
        <span className='option-thumb-big' style={this.type === '0' ?
          {'backgroundImage': 'url(' + MAIN_DIR + this.value + ')'} :
          {'backgroundColor': 'rgba(' + this.value + ')'}} />
      ),
      'c2': this.name,
      'c3': <OptionInfo option={this} />
    };
  }
}

class FileInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'labelText': 'Выберите файл для загрузки',
      'canClear': false
    }

    this.baseLabel = 'Выберите файл для загрузки';
    this.inputRef = React.createRef();

    this.handleChange = this.handleChange.bind(this);
    this.chooseFile = this.chooseFile.bind(this);
    this.clearFile = this.clearFile.bind(this);
  }

  chooseFile(e) {
    e.preventDefault();
    this.inputRef.current.click();
  }

  clearFile(e) {
    e.preventDefault();
    this.inputRef.current.value = null;
    this.setState({
      'labelText': this.baseLabel,
      'canClear': false
    });
    this.props.onChange(null);
  }

  handleChange(e) {
    let files = e.target.files;
    if (files && files.length > 0) {
      if (files.length === 1) {
        this.setState({'labelText': files[0].name});
      } else {
        this.setState({'labelText': 'Несколько файлов'});
      }
      this.setState({'canClear': true});
    }
    this.props.onChange(e.target.files);
  }

  render() {
    return (
      <div>
        <input className='input-file' id='object' type='file' name='file'
          onChange={this.handleChange} multiple={true} ref={this.inputRef} />
        <label className={'input custom-file ' + (this.state.canClear ? 'cf-filled' : 'cf-empty')}
          htmlFor='object'>
          {this.state.labelText}
        </label>
        {this.state.canClear ? (
          <button className='cf-button' onClick={this.clearFile}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        ) : null}
        <button className='cf-button' onClick={this.chooseFile}>
          <FontAwesomeIcon icon={faFolder} />
        </button>
      </div>
    );
  }
}

class Objects extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'modalVisible': false,
      'objects': []
    }

    request('main.php?action=objects').then((json) => {
      const allObjects = json.map((object) => new SObject(object));
      this.setState({'objects': allObjects});
    });

    this.setModalVisible = this.setModalVisible.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  setModalVisible(visible) {
    this.setState({
      'modalVisible': visible
    });
  }

  handleDelete(index) {
    const delObj = this.state.objects[index];
    request('main.php?action=objectdel&id=' + delObj['id']);
    this.state.objects.splice(index, 1);
    this.setState({});
  }

  handleChange() {}

  render() {
    const tableHeaders = ['UID', 'Название', 'Возможные настройки', ''];
    return (
      <div className='container content'>
        {this.state.modalVisible ? (
          <Modal setVisible={this.setModalVisible}>
            <form action={MAIN_DIR + 'main.php?action=objectadd'} method='POST' enctype='multipart/form-data'>
              <div className='form-label'>Файл</div>
              <FileInput onChange={this.handleChange} />
              <div className='button-row'>
                <button className='button button-primary'>
                  <FontAwesomeIcon icon={faCloudUploadAlt} /> Загрузить
                </button>
              </div>
            </form>
          </Modal>
        ) : null}
        <Header catName='Предметы' setModalVisible={this.setModalVisible} objCount={this.state.objects.length} />
        <div className='row'>
          <div className='col page-wrapper'>
            <Table headers={tableHeaders} items={this.state.objects} onDelete={this.handleDelete} />
          </div>
        </div>
      </div>
    );
  }
}

class Options extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'modalVisible': false,
      'cpVisible': false,
      'currentColor': {'r': 255, 'g': 255, 'b': 255},
      'newName': '',
      'newFile': null,
      'options': []
    }

    request('main.php?action=options').then((json) => {
      const allOptions = json.map((option) => new Option(option));
      this.setState({'options': allOptions});
    });

    this.setModalVisible = this.setModalVisible.bind(this);
    this.setCPVisible = this.setCPVisible.bind(this);
    this.switchCP = this.switchCP.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.changeColor = this.changeColor.bind(this);
    this.addOption = this.addOption.bind(this);
    this.nameChange = this.nameChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.fileChange = this.fileChange.bind(this);
  }

  setModalVisible(visible) {
    this.setState({
      'modalVisible': visible
    });
  }

  changeColor(newColor) {
    this.setState({'currentColor': newColor.rgb});
  }

  switchCP(e) {
    e.preventDefault();
    this.setState((state) => ({
      'cpVisible': !state.cpVisible
    }));
  }

  setCPVisible(visible) {
    this.setState({
      'cpVisible': visible
    });
  }

  handleChange(e) {
    let files = e.target.files;
    if (files) {
      this.setState({'labelText': files[0].name});
    }
  }

  rgbaStr(rgbaObj) {
    return `${rgbaObj.r}, ${rgbaObj.g}, ${rgbaObj.b}, ${rgbaObj.a}`;
  }

  addOption(e) {
    if (!this.state.newFile) {
      e.preventDefault();
      const type = '1';
      const value = this.state.newFile ? this.state.newFile :
        this.rgbaStr(this.state.currentColor);
      this.setModalVisible(false);

      const data = new FormData();
      data.append('name', this.state.newName);

      if (this.state.newFile) {
        data.append('file', this.state.newFile);
      } else {
        data.append('value', value);
      }

      request('main.php?action=optionadd', {
        'method': 'POST',
        'mode': 'cors',
        'headers': {'Content-Type': 'application/x-www-form-urlencoded'},
        'referrer': 'no-referrer',
        'body': new URLSearchParams(data)
      }).then((json) => {
        this.state.options.push(new Option({
          'id': json.id,
          'name': this.state.newName,
          'type': type,
          'value': value
        }));
        this.setState({});
      });
    }
  }

  nameChange(e) {
    this.setState({'newName': e.target.value});
  }

  fileChange(file) {
    this.setState({'newFile': file});
  }

  handleDelete(index) {
    const delOpt = this.state.options[index];
    request('main.php?action=optiondel&id=' + delOpt['id']);
    this.state.options.splice(index, 1);
    this.setState({});
  }

  render() {
    const tableHeaders = ['', 'Название', 'Значение', ''];
    const bgColor = {'backgroundColor': 'rgba(' + this.rgbaStr(this.state.currentColor) + ')'};

    return (
      <div className='container content'>
        {this.state.modalVisible ? (
          <Modal setVisible={this.setModalVisible}>
            <form action={MAIN_DIR + 'main.php?action=optionadd'} method='POST'
              encType='multipart/form-data'>
              <div className='form-label'>Название</div>
              <input className='input' type='text' name='name'
                value={this.state.newName} onChange={this.nameChange} />
              <div className='form-label'>Значение</div>
              <FileInput onChange={this.fileChange} />
              <div className='or'>ИЛИ</div>
              <input name='value' type='hidden' value={this.rgbaStr(this.state.currentColor)} />
              <div className='input input-color' style={bgColor}
                onClick={this.switchCP}></div>
              <button className='cf-button' onClick={this.switchCP}>
                <FontAwesomeIcon icon={faEyeDropper} />
              </button>
              {this.state.cpVisible ? (
                <SketchPicker presetColors={[]} width='230px' color={this.state.currentColor}
                className='color-picker' onChangeComplete={this.changeColor} />
              ) : null}
              <div className='button-row'>
                <button className='button button-primary' onClick={this.addOption}>Добавить</button>
              </div>
            </form>
          </Modal>
        ) : null}
        <Header catName='Настройки' setModalVisible={this.setModalVisible} objCount={this.state.options.length} />
        <div className='row'>
          <div className='col page-wrapper'>
            <Table headers={tableHeaders} items={this.state.options} onDelete={this.handleDelete} />
          </div>
        </div>
      </div>
    );
  }
}

class Logout extends React.Component {
  render() {
    return (
      <p>Logged out.</p>
    );
  }
}

class ObjectPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'selectedObject': null,
      'allOptions': {},
      'options': {},
      'selectedOptions': [],
      'modalVisible': false,
      'currentObject': null,
      'activeOptions': {}
    }

    this.viewer = React.createRef();

    request('main.php?action=object&id=' + this.props.match.params.id)
      .then((json) => {
        this.setState({'currentObject': json});
      });

    request('main.php?action=objopt&id=' + this.props.match.params.id)
      .then((json) => {
        this.setState({'options': json});
      });

    request('main.php?action=options')
      .then((json) => {
        const options = {};
        json.forEach((option) => {options[option.id] = option;});
        this.setState({'allOptions': options});
      });

    this.handleSelect = this.handleSelect.bind(this);
    this.deleteOption = this.deleteOption.bind(this);
    this.setModalVisible = this.setModalVisible.bind(this);
    this.selectOption = this.selectOption.bind(this);
    this.addSelectedOptions = this.addSelectedOptions.bind(this);
    this.previewOption = this.previewOption.bind(this);
    this.stopPreview = this.stopPreview.bind(this);
  }

  setModalVisible(visible) {
    this.setState({
      'modalVisible': visible
    });
  }

  isOptionUsed(optionId, options) {
    if (!options) return false;
    for (let i = 0; i < options.length; i++) {
      if (options[i].id === optionId) {
        return true;
      }
    }
    return false;
  }

  selectOption(optionId) {
    if (this.state.selectedOptions.includes(optionId)) {
      let index = this.state.selectedOptions.indexOf(optionId);
      this.state.selectedOptions.splice(index, 1);
    } else {
      this.state.selectedOptions.push(optionId);
    }
    this.setState({});
  }

  deleteOption(index) {
    const matName = this.state.selectedObject.material.name;
    const option = this.state.options[matName][index];
    request('main.php?action=objdelopt&obj_id=' + this.state.currentObject.id +
      '&opt_id=' + option.id);
    this.state.options[matName].splice(index, 1);
    this.setState({});
  }

  handleSelect(object) {
    this.setState({'selectedObject': object});
    console.log(object);
  }

  addSelectedOptions() {
    if (!this.state.selectedObject) return;

    const matName = this.state.selectedObject.material.name;
    if (!(matName in this.state.options)) {
      this.state.options[matName] = [];
    }

    this.state.selectedOptions.forEach((optionId) => {
      const newOption = this.state.allOptions[optionId];
      newOption.obj3d = this.state.selectedObject.name;
      this.state.options[matName].push(newOption);
      const data = new FormData();
      data.append('object_id', this.state.currentObject.id);
      data.append('material', this.state.selectedObject.material.name);
      data.append('object_3d', this.state.selectedObject.name);
      data.append('option_id', optionId);

      request('main.php?action=objaddopt', {
        'method': 'POST',
        'mode': 'cors',
        'headers': {'Content-Type': 'application/x-www-form-urlencoded'},
        'referrer': 'no-referrer',
        'body': new URLSearchParams(data)
      });
    });

    this.setState({'selectedOptions': []});
    this.setModalVisible(false);
  }

  previewOption(option) {
    this.state.activeOptions[option.obj3d] = option;
    this.setState({});
  }

  stopPreview(obj3d) {
    delete this.state.activeOptions[obj3d];
    this.setState({});
  }

  render() {
    let usedOptions = [];
    if (this.state.selectedObject) {
      usedOptions = this.state.options[this.state.selectedObject.material.name];
    }

    let firstOption = null;
    const allOptions = Object.values(this.state.allOptions).map((option) => {
      const optionUsed = this.isOptionUsed(option.id, usedOptions);
      if (!(firstOption || optionUsed)) firstOption = option;
      return optionUsed ? null : (
        <div key={option.id} className={'list-option' +
          (this.state.selectedOptions.includes(option.id) ? ' selected-option' : '')}
          onClick={() => this.selectOption(option.id)}>
          <OptionPreview option={option} />
        </div>
      );
    });

    return (
      <div className='container'>
        {this.state.modalVisible ? (
          <Modal setVisible={this.setModalVisible}>
            <div className='search-wrapper'>
              <input type='text' className='input input-search' placeholder='Поиск'/>
              <FontAwesomeIcon className='search-icon' icon={faSearch} />
            </div>
            <div className='options-list'>{allOptions}</div>
            <button className='button button-primary' onClick={this.addSelectedOptions}
              disabled={this.state.selectedOptions.length === 0}>Добавить</button>
          </Modal>
        ) : null}
        <div className='row'>
          <div className='col'>
            <View3D className='preview' onSelect={this.handleSelect}
              activeOptions={Object.values(this.state.activeOptions)}
              fileUrl={this.state.currentObject ? MAIN_DIR + this.state.currentObject.path : null}
              viewerOptions={{'type': 'EDITOR'}} />
          </div>
        </div>
        <div className='row'>
          <div className='col'>
            <CustomizationTab options={this.state.options} preview={this.previewOption}
              activeOptions={this.state.activeOptions} object={this.state.selectedObject}
              delete={this.deleteOption} stopPreview={this.stopPreview} />
            {this.state.selectedObject && firstOption ? (
              <div className='option-add' onClick={() => this.setModalVisible(true)}>
                <OptionPreview option={firstOption} />
                <span className='expand-arrow'>&#9660;</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

class View3D extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'currentOption': null
    }

    this.canvas = React.createRef();
    this.defaultOptions = {};

    this.getIntersects = this.getIntersects.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.click = this.click.bind(this);
    this.selectObject = this.selectObject.bind(this);
    this.setTexture = this.setTexture.bind(this);
    this.addDefaultOptions = this.addDefaultOptions.bind(this);
    this.applyActiveOptions = this.applyActiveOptions.bind(this);
    this.setDefaultOpt = this.setDefaultOpt.bind(this);
  }

  addDefaultOptions(scene) {
    this.props.activeOptions.forEach((option) => {
      if (!(option.obj3d in this.defaultOptions)) {
        const obj = scene.getObjectByName(option.obj3d);
        this.defaultOptions[option.obj3d] = {
          'color': obj.material.color.clone()
        }
        if (obj.material.map) {
          this.defaultOptions[option.obj3d].mat = obj.material.map;
        }
      }
    });
  }

  applyActiveOptions(scene) {
    this.props.activeOptions.forEach((option) => {
      const obj = scene.getObjectByName(option.obj3d);
      this.setDefaultOpt(obj);
      if (option.type === '0') {
        this.setTexture(obj, MAIN_DIR + option.value);
      } else {
        this.setColor(obj, new THREE.Color('rgb(' + option.value + ')'));
      }
    });
  }

  setDefaultOpt(object) {
    if (object.name in this.defaultOptions) {
      const def = this.defaultOptions[object.name];
      object.material.color.copy(def.color);
      if ('mat' in def) {
        object.material.map = def.mat;
      }
    }
  }

  componentDidMount() {
    this.viewer = new Viewer(this.canvas.current, this.props.viewerOptions);

    this.selObjMatColor = new THREE.Color();
    this.origMatColor = new THREE.Color();

    this.rcNeedsUpdate = true;
    this.raycaster = new THREE.Raycaster();
    this.mouseVector = new THREE.Vector3();

    if (this.props.fileUrl) {
      this.viewer.sload(this.props.fileUrl);
      this.addDefaultOptions(this.viewer.content);
      this.applyActiveOptions(this.viewer.content);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.fileUrl && prevProps.fileUrl !== this.props.fileUrl) {
      this.viewer.sload(this.props.fileUrl);
    }
    this.addDefaultOptions(this.viewer.content);
    for (let obj3d in this.defaultOptions) {
      this.setDefaultOpt(this.viewer.content.getObjectByName(obj3d));
    };
    this.applyActiveOptions(this.viewer.content);
  }

  getIntersects(x, y) {
  	x = (x / this.rcRect.width) * 2 - 1;
  	y = - (y / this.rcRect.height) * 2 + 1;
  	this.mouseVector.set(x, y, 0.5);
  	this.raycaster.setFromCamera(this.mouseVector, this.viewer.activeCamera);
    try {
      return this.raycaster.intersectObject(this.viewer.content, true);
    } catch (error) {
      return [];
    }
  }

  mouseMove(event) {
  	event.preventDefault();

  	if (this.rcNeedsUpdate) {
  		this.rcRect = event.target.getBoundingClientRect();
  		this.rcNeedsUpdate = false;
  	}

  	if (this.rcObject) {
  		if (this.rcObject !== this.selectedObject) {
  			this.rcObject.material.color.copy(this.origMatColor);
  		}
  		this.rcObject = null;
  	}

  	let intersects = this.getIntersects(event.nativeEvent.offsetX,
      event.nativeEvent.offsetY);
  	if (intersects.length > 0) {
  		let res = intersects.filter(function(res) {
  			return res && res.object;
  		})[0];

  		if (res && res.object) {
  			this.rcObject = res.object;
  			this.origMatColor.copy(this.rcObject.material.color);
  			this.rcObject.material.color.set("lime");
  		}
  	}
  }

  click() {
    if (this.rcObject) {
      if (this.selectedObject && this.selectedObject !== this.rcObject) {
        this.selectedObject.material.color.copy(this.selObjMatColor);
      }
      this.selectObject(this.rcObject);
    } else if (this.selectedObject) {
      this.selectedObject.material.color.copy(this.selObjMatColor);
      this.selectedObject = null;
      this.props.onSelect(null);
    }
  }

  selectObject(rcObject) {
  	this.selectedObject = rcObject;
  	this.selObjMatColor.copy(this.origMatColor);
    this.props.onSelect(rcObject);
  }

  setTexture(obj, src, repeat=false) {
    const texture = this.viewer.textureLoader.load(src);
    if (repeat) {
      texture.wrapT = THREE.RepeatWrapping;
      texture.wrapS = THREE.RepeatWrapping;
      texture.repeat.set(10, 10);
    }
    obj.material.map = texture;
  }

  setColor(obj, color) {
    obj.material.color.copy(color);
  }

  render() {
    return (
      <canvas id='3d' className={this.props.className} ref={this.canvas}
        onMouseMove={this.mouseMove} onClick={this.click}></canvas>
    );
  }
}

class CustomizationTab extends React.Component {
  render() {
    let listItems = null;
    const object = this.props.object;
    const defaultOption = {
      'id': 0,
      'name': 'Стандартный'
    };

    if (object) {
      if (object.material.map) {
        defaultOption.type = '0';
        defaultOption.value = object.material.map.image;
      } else {
        defaultOption.type = '1';
        defaultOption.value = '#' + object.material.color.getHexString();
      }

      const matName = object.material.name;
      if (matName in this.props.options) {
        listItems = this.props.options[matName].map((option, index) =>
          <OptionItem key={option.id} option={option} index={index}
            delete={this.props.delete} preview={this.props.preview}
            stopPreview={this.props.stopPreview}
            activeOptions={this.props.activeOptions} />
        );
      }
    }

    return (
      object ? (
        <div>
          <h2 className='object-name'>{object.material.name}</h2>
          <div className='option-items'>
            <OptionItem option={defaultOption} />
            {listItems}
          </div>
        </div>
      ) : null
    );
  }
}

class OptionItem extends React.Component {
  constructor(props) {
    super(props);
    this.imgWrap = React.createRef();
  }

  createBox(option) {
    if (option.id === 0) {
      if (option.type === '0') {
        option.value.className = 'option-box';
        return (<span ref={this.imgWrap}></span>);
      } else {
        return (<span className='option-box'
          style={{'backgroundColor': '#' + this.props.option.value}}></span>);
      }
    } else {
      return (
        <span className='option-box' style={option.type === '0' ?
          {'backgroundImage': 'url(' + MAIN_DIR + this.props.option.value + ')'} :
          {'backgroundColor': 'rgba(' + this.props.option.value + ')'}}></span>
      );
    }
  }

  render() {
    const selected = this.props.activeOptions &&
      (this.props.option.obj3d in this.props.activeOptions) &&
      (this.props.activeOptions[this.props.option.obj3d].id === this.props.option.id);
    return (
      <div className='option-item'>
        {this.createBox(this.props.option)}
        {this.props.option.name}
        {this.props.preview ? (
          <button className={'button ' + (selected ? 'button-gray-inv' : 'button-gray')}
            onClick={() => {
              if (selected) {
                this.props.stopPreview(this.props.option.obj3d);
              } else {
                this.props.preview(this.props.option);
              }
            }}>
            <FontAwesomeIcon icon={faEye} />
          </button>
        ) : null}
        {this.props.delete ? (
          <button className='button button-gray'
            onClick={() => this.props.delete(this.props.index)}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        ) : null}
      </div>
    );
  }
}

function App() {
  return (
    <Router>
      <Navigation />
      <div className='page'>
        <Route exact path='/objects/' component={Objects} />
        <Route path='/objects/:id' component={ObjectPage} />
        <Route exact path='/options/' component={Options} />
        <Route path='/logout' component={Logout} />
      </div>
    </Router>
  );
}

export default App;
