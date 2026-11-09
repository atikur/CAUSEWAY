/** UIKit composition helpers only. Layout owns positions; callers own content. */
import {BackPlate} from 'SpectaclesUIKit.lspkg/Scripts/BackPlate';
import {FlexLayout} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout';
import {FlexItem} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem';
import {FlexDirection,FlexAlign,FlexAlignSelf,FlexJustify} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes';
import {Button} from 'SpectaclesUIKit.lspkg/Scripts/Components/Button/Button';
import {ElementContent} from 'SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent';
export function obj(parent:SceneObject,name:string,z=0):SceneObject {
  const o=global.scene.createSceneObject(name);o.setParent(parent);o.getTransform().setLocalPosition(new vec3(0,0,z));return o;
}
export function applyTextRole(t:Text,role:'HeadlineXL'|'Subheadline'|'Body'|'Caption',scale=1):void {
  const size={HeadlineXL:62,Subheadline:41,Body:39,Caption:38};
  t.size=size[role]*scale;(t as Text&{weight?:number}).weight=role==='HeadlineXL'||role==='Subheadline'?700:500;
}
export function flex(parent:SceneObject,width:number,height:number,row=false,gap=0.5):FlexLayout {
  const f=parent.createComponent(FlexLayout.getTypeName()) as FlexLayout;
  f.autoDiscoverItemsOnStart=false;
  f.onInitialized.add(()=>{
    f.width=width;f.height=height;f.direction=row?FlexDirection.Row:FlexDirection.Column;
    f.alignItems=FlexAlign.Stretch;f.justifyContent=FlexJustify.Center;f.rowGap=gap;f.columnGap=gap;
  });return f;
}
export function child(layout:FlexLayout,width:number,height:number,name:string):SceneObject {
  const o=obj(layout.getSceneObject(),name,0.05),item=o.createComponent(FlexItem.getTypeName()) as FlexItem;
  item.overrideWidth=width;item.overrideHeight=height;item.alignSelf=FlexAlignSelf.Stretch;item.flexShrink=0;
  layout.addItems([item]);return o;
}
export function panel(root:SceneObject,width:number,height:number):FlexLayout {
  root.createComponent('Component.Canvas');
  const plate=root.createComponent(BackPlate.getTypeName()) as BackPlate;plate.size=new vec2(width,height);plate.style='dark';
  const content=obj(root,'Content',0.6);return flex(content,width-3,height-2,false,0.5);
}
export function text(layout:FlexLayout,width:number,height:number,value:string,role:'HeadlineXL'|'Subheadline'|'Body'|'Caption',scale:number,color:vec4):Text {
  const o=child(layout,width,height,'Text '+value.slice(0,20)),t=o.createComponent('Component.Text') as Text;
  t.text=value;t.depthTest=true;applyTextRole(t,role,scale);t.textFill.color=color;
  t.horizontalAlignment=HorizontalAlignment.Center;t.verticalAlignment=VerticalAlignment.Center;
  t.horizontalOverflow=HorizontalOverflow.Wrap;t.verticalOverflow=VerticalOverflow.Truncate;
  t.layoutRect=Rect.create(-width/2,width/2,-height/2,height/2);return t;
}
export function button(layout:FlexLayout,width:number,label:string,callback:()=>void,icon:Texture|null=null):{button:Button;content:ElementContent} {
  return buttonContent(child(layout,width,4.2,'Action '+label),width,label,callback,icon);
}
export function buttonContent(o:SceneObject,width:number,label:string,callback:()=>void,icon:Texture|null=null):{button:Button;content:ElementContent} {
  const b=o.createComponent(Button.getTypeName()) as Button;
  b.size=new vec3(width,4.2,0.5);
  const c=o.createComponent(ElementContent.getTypeName()) as ElementContent;
  c.autoResize=false;
  c.text=label;c.textSize=39;c.contentAlignment='center';c.padding={top:0.5,right:0.5,bottom:0.5,left:0.5};
  if(icon){c.leadingIcon=icon;c.iconLayout='left';}
  b.onTriggerUp.add(callback);return {button:b,content:c};
}
