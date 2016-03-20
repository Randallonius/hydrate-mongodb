import {ObjectMappingBuilder} from "./objectMappingBuilder";
import {MappingModel} from "../mappingModel";
import {
    EntityAnnotation,
    EmbeddableAnnotation,
    DiscriminatorFieldAnnotation,
    DiscriminatorValueAnnotation,
} from "./annotations";

/**
 * @hidden
 */
export class ClassMappingBuilder extends ObjectMappingBuilder {

    protected populateCore(): void {

        var mapping = <MappingModel.ClassMapping>this.mapping;

        mapping.name = this.type.name;
        mapping.classConstructor = <any>this.type.ctr;

        // get type level annotations
        var annotations = this.type.getAnnotations();
        for(var i = 0, l = annotations.length; i < l; i++) {
            var annotation = this.context.currentAnnotation = annotations[i];

            switch (annotation.constructor.name) {
                case "DiscriminatorFieldAnnotation":
                    this._setDiscriminatorField(mapping, <DiscriminatorFieldAnnotation>annotation);
                    break;
                case "DiscriminatorValueAnnotation":
                    this._setDiscriminatorValue(mapping, <DiscriminatorValueAnnotation>annotation);
                    break;
            }
        }

        this.context.currentAnnotation = null;

        // add default values
        if (mapping.flags & MappingModel.MappingFlags.InheritanceRoot) {
            if (!mapping.discriminatorField) {
                mapping.discriminatorField = this.context.config.discriminatorField;
            }
        }

        // if we are a document type and the the discriminatorValue is not set, default to the class name
        if (!mapping.discriminatorValue  && (mapping.hasBaseClass || mapping.hasSubClasses)) {
            mapping.setDiscriminatorValue(this.context.config.discriminatorNamingStrategy(mapping.name));
        }

        super.populateCore()
    }

    private _setDiscriminatorField(mapping: MappingModel.ClassMapping, annotation: DiscriminatorFieldAnnotation): void {

        if(this._assertRootClassMapping(mapping)) {
            if(!annotation.name) {
                this.context.addError("Missing discriminator field name.");
                return;
            }
            mapping.discriminatorField = annotation.name;
        }
    }

    private _setDiscriminatorValue(mapping: MappingModel.ClassMapping, annotation: DiscriminatorValueAnnotation): void {

        if(this._assertClassMapping(mapping)) {
            if(!annotation.value) {
                this.context.addError("Missing discriminator value.");
                return;
            }

            try {
                mapping.setDiscriminatorValue(annotation.value);
            }
            catch(err) {
                this.context.addError(err.message);
            }
        }
    }

    private _assertClassMapping(mapping: MappingModel.Mapping): boolean {

        if(!(mapping.flags & MappingModel.MappingFlags.Class)) {
            this.context.addError("Annotation can only be defined on class mappings.");
            return false;
        }
        return true;
    }

    protected _assertRootClassMapping(mapping: MappingModel.Mapping): boolean {

        if(!this._assertClassMapping(mapping)) return false;

        var classMapping = <MappingModel.ClassMapping>mapping;
        if(!(classMapping.flags & MappingModel.MappingFlags.InheritanceRoot)) {
            this.context.addError("Annotation can only be defined on classes that are the root of a mapped inheritance hierarchy.");
        }
        return true;
    }
}
